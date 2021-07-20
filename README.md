# tulo.js
Making service workers easy to use so that your app can be fast and reliable, even offline.

Welcome to **tulo.js** - a light-weight, importable service worker library that allows you to leverage one of the coolest new browser features to make your website more robust. The current version of tulo.js supports the following functionalities:
  - Set up configurable individualized caching strategies for different file types (markups, stylesheets, images, fonts, etc.) based on your business needs
  - Connect to **[tulojs.com](https://tulojs.com)** to monitor caching activity and throughput across multiple dimensions including: strategy, resource/end-point, size and load times, connection types, and device types
  

Connect with us to let us know what you think - and raise any issues on Github issues..

## Getting Started
### Install Library

1) Run ```npm i tulo-js``` in your existing node project.

### Create a `service-worker.js` in your root public directory

2) Run ```touch service-worker.js``` in your root public directory to create the service worker file.
3) If you are using Express.js to serve your front-end, create a path for `node_modules/tulo-js/index.js` and call it `/tulo`. Otherwise, include `node_modules/tulo-js/index.js` in the next step instead of `/tulo`.
4) In `service-worker.js`, import the tulo library:
  ```js
    import { cacheGenerator } from '/tulo';
  ```
5) Add a version number. Remember to update this version number whenever you make updates to this file. This will ensure that a new service worker is generated and your caches are automatically refreshed.
  ```js
    const version = 1.0; //update version number everytime you update this file to effect changes
  ```
6) Develop a caching strategy for each of your website's end-points (i.e. pages, stylesheets, images, logos, fonts, icons, audio/video, etc.). For example, you might want your pages to be refreshed from the network whenever possible, so your caching strategy would be NetworkFirst. This would both ensure that your page always loads from the Network, but also keeps your cache up-to-date. However when your client goes offline, then your pages can still load the most recent site in your cache giving your users a **rich and seamless experience**.
7) For each unique caching strategy (and maybe filetype), write a cache specification. Here is a sample one for caching your images. See step 9 for a boiletplate cache spec you can copy and paste into your `service-worker.js` file.
  ```js
    const imageCacheSpec = {
      name: 'imageCache' + version,
      types: ['image/png'],
      urls: ['/bluewill.png'],
      strategy: 'CacheFirst',
      expiration: 60*60*1000
    };
  ```
9) Here is a boilerplate cache spec you can copy and paste in your file:
  ```js
    const sampleCacheSpec = {
      name: 'sampleCache'+version, //give your cache a name and tag on the version number
      types: [], //input HTML MIME types e.g. text/html, text/css, image/gif, etc.
      urls: [], //input any reachable file paths to be cached that correspond to the types specific to this cacheSpec
      strategy: '', //currently supported strategies are: CacheFirst, NetworkFirst, NetworkOnly
      expiration: 60*60*1000 //in miliseconds: 60*1000 = 1 minute, 20*60*1000 = 20 minutes - this field is OPTIONAL - if omitted, these urls will be refreshed when       the service worker restarts
    }
  ```
10) Add all your cache specifications into an array, and pass it as an argument to the `cacheGenerator` function.
  ```js
    //If you have multiple cacheSpecs for different filetypes, include your page/markup caches first followed by images, stylesheets, fonts, etc.
    cacheGenerator([sampleCacheSpec]);
  ```

### Register Service Worker

11) In your root file, add the following code snippet. If you are running a React app, this might be in your top-level component (i.e. `App.jsx`). If you are creating a project with vanilla Javascript, then add this snippet in your root HTML file at the bottom of your body tag within <script type="module"> </script> tags.

  ```js
    if (navigator.serviceWorker) {
      await navigator.serviceWorker.register('service-worker.js', {
          type: 'module',
          scope: '/'
        })
        .then((registration) => console.log(`Service worker registered in scope: ${registration.scope}`))
        .catch((e) => console.log(`Service worker registration failed: ${e}`));
    }
```

### Test your Service Worker 

12) Serve your application. Open up Google Chrome. Navigate to your website. Open up your Chrome Dev Tools by typing cmd+option+I. Navigate to the Application menu. Click on Service Worker. You should see a new service worker installed and running (see screenshot).

### Test your Caches

13) When you check your Dev Console in Chrome, you should see your Service Worker Registered, Installed, and Activated. When you navigate to Cache Storage in the Application menu, you should see the caches for which you created specifications with the end-points/resources cached versions of the end-points in them (see screenshot).

### Sign Up on tulojs.com for monitoring and insights

14) Visit tulojs.com/docs for information on how to sign up and use tulojs.com in conjunction with the library

### Important Points

- Service Workers can only work with HTTPS end points unless you are working in localhost.
 
