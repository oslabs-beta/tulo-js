const METRICS_BATCH_SIZE = 10;
export const cacheGenerator = (cacheSpecs) => {
  let metricsQueue = [];
  const sendMetrics = (metrics) => {
    console.log(metrics?.message);
    if (navigator.onLine && metricsQueue.length >= METRICS_BATCH_SIZE) {
      //sends to server
      //flush queue if online
      console.log('Sending to Server and Flushing Metrics Queue');
      metricsQueue = [];
    } else {
      metricsQueue.push(metrics);
      console.log('Adding to Metrics Queue. Current Queue:', metricsQueue);
    }
  };

  const setUpCache = () => {
    try {
      return cacheSpecs.forEach(async (spec) => {
        const cache = await caches.open(spec.name);
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

  const cacheFirst = async (e, cacheName) => {
    try {
      const { request } = e;
      const cache = await caches.open(cacheName);
      let response = await cache.match(request);
      if (response) {
        sendMetrics({ message: 'Found in Cache' });
        return response;
      }

      sendMetrics({ message: 'Not Found in Cache' });
      response = await fetch(request);
      if (response) {
        sendMetrics({ message: 'Found in Network' });
        let copy = response.clone();
        e.waitUntil(
          cache.put(request, copy)
        )
        sendMetrics({ message: 'Added to Cache' });
        return response;
      }
      
      sendMetrics({ message: 'Not Found in Network' });
      return new Response();
    } catch (err) {
      console.error('Somewthing went wrong', err);
    }
  };

  const networkFirst = async (e, cacheName) => {
    try {
      const { request } = e;
      const cache = await caches.open(cacheName);
      let response = await fetch(request);
      if (response) {
        sendMetrics({ message: 'Found in Network' });
        let copy = response.clone();
        e.waitUntil(
          cache.put(request, copy)
        )
        sendMetrics({ message: 'Added to Cache' });
        return response;
      }
      
      sendMetrics({ message: 'Not Found in Network' });
      return new Response();
    } catch (err) {
      console.error('Somewthing went wrong', err);
    }
  };

  const runStrategy = async (e) => {
    const { request } = e;
    const spec = getSpec(request);
    if (!spec) return await fetch(request);
    const { strategy } = spec;
    switch(strategy){
      case 'CacheFirst': return cacheFirst(e, spec.name)
      case 'NetworkFirst': return networkFirst(e, spec.name)
      default: return new Response()
    };
  };

  self.addEventListener('fetch', (e) => {
    console.log('Service Worker Fetching...');
    e.respondWith(runStrategy(e));
  });
};
