# tulo.js

_Making service workers easy to use so that your app can be fast and reliable, even offline._

Welcome to **tulo.js**, a service worker library that allows you to implement caching strategies via the powerful [Service Worker browser API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) to make your website more robust. 

The current version of tulo.js supports the following functionality:

  - Configure caching strategies for different files (markup, stylesheets, images, fonts, etc.) based on your business needs
  - Sign in to **[tulojs.com](https://tulojs.com)** to monitor caching activity from your deployed website for each resource/file including average load times, resource size, and user connection types (e.g. 4G, 2G, Offline)
  
Thanks for checking out our library! Please let us know of any feature requests or bugs by raising a GitHub issue.

## Getting Started

### Installation

1) Run ```npm i tulo-js``` in your project's root directory to install the tulo-js npm package.

### Add a service worker

2) Run ```touch service-worker.js``` in your project's `public/` directory (or wherever you store static assets) to create the service worker file. You could call this file `sw.js` (or whatever you like) if you prefer a shorter name.

3) If you are using Express.js to serve your front-end, create an endpoint to responsd to GET requests to `/tulo` that sends `node_modules/tulo-js/tulo.js` as a response. Otherwise, adjust your import statement in the next step to `node_modules/tulo-js/tulo.js` in the next step instead of `/tulo` (see below).

4) At the top of `service-worker.js`, import the tulo library:
  
  ```js
    // Use the below import statement if you set up an Express endpoint
    import { cacheGenerator } from '/tulo';
    // Otherwise, import the library from node_modules
    import { cacheGenerator } from 'node_modules/tulo-js/tulo.js';
  ```

5) Add a version number to `service-worker.js`. Remember to update this version number whenever you make updates to this file. This will ensure that a new service worker is installed then activated and your caches are automatically refreshed when you update your caching strategy.
  
  ```js
    const version = 1.0; // update version number everytime you update this file to effect changes
  ```

6) Develop a caching strategy for each of your website's resources (i.e. pages, stylesheets, images, logos, fonts, icons, audio/video, etc.). For example, you might want your pages to be requested fresh from the network whenever possible, so your caching strategy would be `NetworkFirst`. A `NetworkFirst` strategy will retrieve the resource from the network and add it to the cache. If the network fails or the server is down on a subsequent request, the resource will be served from the cache as a fallback. That way, if your users go offline, they can still access your pages from the cache if it has been populated on previous requests. That is the magic of service workers! Here are the caching strategies currently supported by tulo.js:

  - `NetworkFirst`: Requests resource from the network, serves response to user, and adds resource to the specified cache. If the network request fails – either due to a faulty/offline connection or a server error – the service worker will check the cache for that resource and serve it to the client if found
  - `CacheFirst`: Checks caches to see if the requested resource has already been cached, and serves it to the client if so. Otherwise, requests resource from the network and stores it in the specified cache
  - `NetworkOnly`: Requests resource from the network and serves response to user. If the network request fails, a message is sent in response that the resource could not be found

7) For each unique caching strategy (e.g. a caching strategy for images), write a cache specification in `service-worker.js`. Sample code for caching your images is provided below. See step 8 for a boilerplate cache spec you can copy and paste into your `service-worker.js` file.
  
  ```js
    const imageCacheSpec = {
      name: 'imageCache' + version,
      types: ['image/png'],
      urls: ['/logo.png', '/icon.png', 'banner.png'],
      strategy: 'CacheFirst',
      expiration: 60*60*1000
    };
  ```

8) Here is a boilerplate cache spec you can copy and paste in your file:
  
  ```js
    const sampleCacheSpec = {
      name: 'sampleCache' + version, // give your cache a name, concatenated to the version so you can verify your cache is up-to-date in the browser
      types: [], // input HTML MIME types e.g. text/html, text/css, image/gif, etc.
      urls: [], // input any file paths to be cached using this cacheSpec
      strategy: '', // currently supported strategies are: CacheFirst, NetworkFirst, NetworkOnly
      expiration: 60*60*1000 // in milliseconds - this field is OPTIONAL - if omitted, these urls will be refreshed when the service worker restarts
    }
  ```

9) At the bottom of `service-worker.js`, add all your cache specifications into an array, and pass it as an argument to the `cacheGenerator` function.
  
  ```js
    // If you have multiple cacheSpecs for different file types, include your page/markup caches first followed by images, stylesheets, fonts, etc.
    cacheGenerator([pagesCacheSpec, imageCacheSpec, stylesCacheSpec, fontCacheSpec]);
  ```

### Register Service Worker

10) In your project's root file, add the below code snippet to register your service worker. If you are running a React app, this would be in your top-level component (i.e. `App.jsx` or `index.jsx`). If you are creating a project with static HTML pages, add this snippet in your root HTML file (i.e. `index.html`) at the bottom of your body tag within an opening `<script type="module">` tag and a closing `</script>` tag.

  ```js
    if (navigator.serviceWorker) {
      await navigator.serviceWorker.register('service-worker.js', {
          type: 'module',
          scope: '/'
        })
        // To ensure your service worker registers properly, chain then/catch below - feel free to remove once it is successfully registering
        .then((registration) => console.log(`Service worker registered in scope: ${registration.scope}`))
        .catch((e) => console.log(`Service worker registration failed: ${e}`));
    }
```

### Check your service worker and caches in DevTools

11) Serve your application. Open up Google Chrome and navigate to your website. Open up your Chrome DevTools by clicking inspect (or entering cmd+option+I on Mac, ctrl+shift+I on Windows). Navigate to the Application panel and click Service Worker on the sidebar. You should see a new service worker installed and activated.

12) Click on Cache Storage in the Application panel sidebar under Cache. Here you should be able to see each cache you created in `service-worker.js` and the files stored in them.

### Sign in on tulojs.com for monitoring and insights

13) Visit tulojs.com/dashboard to monitor your caching strategies in production. You'll be able to view the caching strategies you implemented on a per resource basis, including statistics on cache events and your users. For example, what percentage of the time is your site's logo image being fetched from the cache versus the network? What is the difference in average load time when it is fetched from the cache versus the network? What percentage of your users are accessing your `about` page when their connection is offline?

## Notes & Resources

- Service Workers only work with HTTPS (localhost is an exception)
- [web.dev](https://web.dev/) has many fantastic articles on service workers, caching, and more – check out the [overview on workers](https://web.dev/workers-overview/) to get started
- [Workbox] is a robust library for service worker implementation if you are interested in diving deeper on caching possibilities (it served as an inspiration for making tulo.js as a lightweight library with monitoring insights)
- [serviceworke.rs](https://serviceworke.rs/) is a great website with a cookbook for service workers if you want to get your hands dirty building from scratch
