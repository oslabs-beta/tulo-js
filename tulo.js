export const cacheGenerator = (cacheSpecs) => {
  const version = 1.0;

  const sendMetrics = (metrics) => {
    //sends to server
    console.log(metrics?.message);
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

  const getSpec = request => {
    for(const spec of cacheSpecs){
      const types = spec.types;
      for(let type of types){
        console.log('Type',type);
        if (request.headers.get('Accept').includes(type)){
          return spec;
        }
      }
    }
  }

  const cacheFirst = async (request, cacheName) => {
    try{
      const cache = await caches.open(cacheName);
      let res = await cache.match(request);
      if(res){
        sendMetrics({message: 'Found in Cache'});
      } else{
        sendMetrics({message: 'Not Found in Cache'});
        res = await fetch(request);
        if(res){
          sendMetrics({message: 'Found in Network'});
        } else{
          sendMetrics({message: 'Not Found in Network'});
        }
      }
      return res;
    } catch(err){
      console.error('Somewthing went wrong');
    }
  }

  const runStrategy = (request) => {
    const spec = getSpec(request);
    console.log(spec);
    const { strategy } = spec;
    if(strategy === 'CacheFirst'){
      return cacheFirst(request, spec.name);
    }
  }
  self.addEventListener('fetch', (e) => {
    const { request } = e;
    console.log('Service Worker Fetching...');
    e.respondWith(
      runStrategy(request)
    )
  });
};
