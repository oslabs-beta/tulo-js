export const cacheGenerator = (imageUrls, pageUrls, staticUrls) => {
  const version = 1.0;
  const imageCacheName = 'imageCache' + version;
  const pageCacheName = 'pageCache' + version;
  const staticCacheName = 'staticCache' + version;
  const cacheList = [imageCacheName, pageCacheName, staticCacheName];

  // /** Input Image, Html, and Static files to cache */
  // const imageUrls = [
  //   /**Enter paths of images to cache **/
  // ];
  // const pageUrls = [
  //   /**Enter paths of pages to cache **/
  // ];
  // const staticUrls = [
  //   /**Enter paths of static files (e.g. css, js) to cache **/
  // ];

  const sendMetrics = (metrics) => {
    //sends to server
  };

  const setUpCache = async () => {
    try {
      const staticCache = await caches.open(staticCacheName);
      staticCache.addAll(staticUrls);
      const imageCache = await caches.open(imageCacheName);
      imageCache.addAll(imageUrls);
      const pageCache = await caches.open(pageCacheName);
      return pageCache.addAll(pageUrls);
    } catch (err) {
      console.error('Error opening cache');
    }
  };

  self.addEventListener('install', (e) => {
    console.log('Service Worker Installing...');
    skipWaiting();
    // e.waitUntil(setUpCache());
  });

  const deleteOldCaches = async () => {
    const cacheNames = await caches.keys();
    return cacheNames.map((name) => {
      if (!cacheList.includes(name)) caches.delete(name);
    });
  };

  self.addEventListener('activate', (e) => {
    console.log('Service Worker Activated.');
    // e.waitUntil(deleteOldCaches().then(() => clients.claim()));
  });

  self.addEventListener('fetch', (e) => {
    console.log('Service Worker Fetching..');
    // const { request } = e;
    // if (request.headers.get('Accept').includes('text/html')) {
    //   //apply network only
    //   e.respondWith(
    //     fetch(request)
    //       .then((res) => {
    //         sendMetrics({
    //           strategy: 'Network with Cache Fallback',
    //           endpoint: request.url,
    //           action: 'Fetched from Network',
    //           timestamp: Date.now(),
    //         });
    //         return res;
    //       })
    //       .catch((err) => {
    //         //if network fails, fall back on cache
    //         sendMetrics({
    //           strategy: 'Network with Cache Fallback',
    //           endpoint: request.url,
    //           action: 'Failed in Network',
    //           timestamp: Date.now(),
    //         });
    //         return caches.match('/index.html').then((res) => {
    //           if (res) {
    //             sendMetrics({
    //               strategy: 'Network with Cache Fallback',
    //               endpoint: request.url,
    //               action: 'Fetched from Cache',
    //               timestamp: Date.now(),
    //             });
    //             // TODO: if cache fails, send a message indicating failure
    //             return res;
    //           }
    //         });
    //       })
    //   );
    // } else if (request.headers.get('Accept').includes('image')) {
    //   //cache first strategy
    //   e.respondWith(
    //     caches.match(request).then((res) => {
    //       if (res) {
    //         sendMetrics({
    //           strategy: 'Cache First',
    //           endpoint: request.url,
    //           action: 'Fetched from Cache',
    //           timestamp: Date.now(),
    //         });
    //         return res; //returned cached
    //       }
    //       sendMetrics({
    //         strategy: 'Cache First',
    //         endpoint: request.url,
    //         action: 'Failed in Cache',
    //         timestamp: Date.now(),
    //       });
    //       fetch(request)
    //         .then((res) => {
    //           sendMetrics({
    //             strategy: 'Cache First',
    //             endpoint: request.url,
    //             action: 'Fetched from Network',
    //             timestamp: Date.now(),
    //           });
    //           const resClone = res.clone();
    //           caches.open(imageCacheName).then((cache) => {
    //             sendMetrics({
    //               strategy: 'Cache First',
    //               endpoint: request.url,
    //               action: 'Added to Cache',
    //               timestamp: Date.now(),
    //             });
    //             return cache.put(request, resClone);
    //           });
    //         })
    //         .catch((err) => console.error('failed to fetch from network', err));
    //     })
    //   );
    // } else {
    //   //cache first response
    //   e.respondWith(
    //     caches.match(request).then((res) => {
    //       if (res) {
    //         sendMetrics({
    //           strategy: 'Cache First',
    //           endpoint: request.url,
    //           action: 'Fetched from Cache',
    //           timestamp: Date.now(),
    //         });
    //         return res; //returned cached
    //       }
    //       sendMetrics({
    //         strategy: 'Cache First',
    //         endpoint: request.url,
    //         action: 'Failed in Cache',
    //         timestamp: Date.now(),
    //       });
    //       fetch(request)
    //         .then((res) => {
    //           sendMetrics({
    //             strategy: 'Cache First',
    //             endpoint: request.url,
    //             action: 'Fetched from Network',
    //             timestamp: Date.now(),
    //           });
    //           const resClone = res.clone();
    //           caches.open(staticCacheName).then((cache) => {
    //             sendMetrics({
    //               strategy: 'Cache First',
    //               endpoint: request.url,
    //               action: 'Added to Cache',
    //               timestamp: Date.now(),
    //             });
    //             return cache.put(request, resClone);
    //           });
    //         })
    //         .catch((err) => console.error('failed to fetch from network', err));
    //     })
    //   );
    // }
  });
};
