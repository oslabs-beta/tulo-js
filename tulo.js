export const cacheGenerator = (cacheSpecs) => {
  let expirations = {};
  const METRICS_BATCH_SIZE = 30;

  //simple mutex
  let isLocked = false;
  const lock = () => (isLocked = true);
  const unLock = () => (isLocked = false);

  const sendMetrics = async (metrics) => {
    if (isLocked)
      return setTimeout(async () => await sendMetrics(metrics), 1000);
    lock();
    const metricsCache = await caches.open('metrics');
    metrics.connection = navigator.onLine
      ? navigator.connection.effectiveType
      : 'offline';
    metrics.device = navigator.userAgent;
    metricsCache.put(
      `/${metrics.url}_${metrics.timestamp}`,
      new Response(JSON.stringify(metrics))
    );
    const cacheSize = (await metricsCache.keys()).length;
    if (navigator.onLine && cacheSize >= METRICS_BATCH_SIZE) {
      const metricsQueue = [];
      let sentToServer = false;
      try {
        for (const request of await metricsCache.keys()) {
          const response = await metricsCache.match(request);
          metricsQueue.push(await response.json());
        }
        //sends to server
        await fetch('https://tulojs.com/api/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metricsQueue),
        });
        sentToServer = true;
      } catch (err) {
        console.error('Sending to Server Failed', err);
        sentToServer = false;
      } finally {
        const cacheSize = (await metricsCache.keys()).length;
        if (sentToServer) {
          for (const request of await metricsCache.keys()) {
            await metricsCache.delete(request);
          }
        }
      }
    }
    unLock();
  };

  const setUpCache = () => {
    try {
      return cacheSpecs.forEach(async (spec) => {
        const cache = await caches.open(spec.name);
        if (spec.expiration)
          expirations[spec.name] = spec.expiration + Date.now();
        return cache.addAll(spec.urls);
      });
    } catch (err) {
      console.error('Error opening cache');
    }
  };

  self.addEventListener('install', (e) => {
    console.log('Service Worker Installing...');
    skipWaiting();
    e.waitUntil(setUpCache());
  });

  const deleteOldCaches = async () => {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      let found = false;
      for (const spec of cacheSpecs) {
        if (cacheName === spec.name) {
          found = true;
          break;
        }
      }

      if (!found) caches.delete(cacheName);
    }
  };

  self.addEventListener('activate', (e) => {
    console.log('Service Worker Activated.');
    e.waitUntil(deleteOldCaches().then(() => clients.claim()));
  });

  const getSpec = (request) => {
    for (const spec of cacheSpecs) {
      const types = spec.types;
      for (let type of types) {
        if (request.headers.get('Accept').includes(type)) {
          return spec;
        }
      }
    }
  };

  const grabFromCache = async (e, spec, comment) => {
    const { request } = e;
    const { name } = spec;

    if (expirations[name] && Date.now() > expirations[name]) {
      //cache expired
      expirations[name] = spec.expiration + Date.now();
      try {
        const responseFromNetwork = await grabFromNetwork(
          e,
          spec,
          'Cache Expired'
        );
        e.waitUntil(addToCache(request, responseFromNetwork.clone(), name));
        return responseFromNetwork;
      } catch (err) {
        return noMatch();
      }
    }

    const start = performance.now();
    const cache = await caches.open(name);
    const response = await cache.match(request);
    const end = performance.now();
    if (response) {
      sendMetrics({
        strategy: spec.strategy,
        url: request.url,
        message: (comment ? comment : '') + ':Found in Cache',
        size: response.headers.get('content-length'),
        loadtime: end - start,
        timestamp: Date.now(),
      });
      return response;
    }
  };

  const grabFromNetwork = async (e, spec, comment) => {
    const { request } = e;
    const start = performance.now();
    const response = await fetch(request);
    const end = performance.now();

    sendMetrics({
      strategy: spec ? spec.strategy : 'NoStrategy',
      url: request.url,
      message: (comment ? comment : '') + ':Found in Network',
      size: response.headers.get('content-length'),
      loadtime: end - start,
      timestamp: Date.now(),
    });

    return response;
  };

  const addToCache = async (request, response, cacheName) => {
    const cache = await caches.open(cacheName);
    return cache.put(request, response);
  };

  const noMatch = () => {
    const response = new Response('No Match Found');
    return response;
  };

  const networkOnly = async (e, spec) => {
    try {
      return await grabFromNetwork(e, spec);
    } catch (err) {
      return noMatch();
    }
  };

  const cacheOnly = async (e, spec) => {
    return (await grabFromCache(e, spec)) ?? noMatch();
  };

  const cacheFirst = async (e, spec) => {
    try {
      return (
        (await grabFromCache(e, spec)) ??
        (await grabFromNetwork(e, spec, 'Not Found in Cache'))
      );
    } catch (err) {
      return noMatch();
    }
  };

  const networkFirst = async (e, spec) => {
    try {
      const response = await grabFromNetwork(e, spec);
      e.waitUntil(addToCache(e.request, response.clone(), spec.name));
      return response;
    } catch (err) {
      return (
        (await grabFromCache(e, spec, 'Not Found in Network')) ?? noMatch()
      );
    }
  };

  const runStrategy = async (e) => {
    const { request } = e;
    const spec = getSpec(request);
    if (!spec) {
      //no cache found for resource
      return await networkOnly(e);
    }

    const { strategy } = spec;
    switch (strategy) {
      case 'CacheFirst':
        return await cacheFirst(e, spec);
      case 'NetworkFirst':
        return await networkFirst(e, spec);
      case 'CacheOnly':
        return await cacheOnly(e, spec);
      case 'NetworkOnly':
        return await networkOnly(e, spec);
      default:
        console.error(`${strategy} for ${request.url} does not exist - sending to network`)
        return await networkOnly(e);
    }
  };

  self.addEventListener('fetch', (e) => {
    console.log('Service Worker Fetching...');
    e.respondWith(runStrategy(e));
  });
};
