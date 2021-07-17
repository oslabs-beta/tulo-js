import { cacheGenerator } from '/tulo';
const version = 3.0;

const pageCacheSpec = {
  name: 'pageCache'+version,
  types: ['text/html'],
  urls: ['/', '/index.html'],
  strategy: 'NetworkFirst'
}

const staticCacheSpec = {
  name: 'staticCache'+version,
  types: ['text/css'],
  urls: ['/styles.css'],
  strategy: 'CacheFirst',
  expiration: 60*60*1000//in miliseconds: 60*1000 = 1 minute, 20*60*1000 = 20 minutes
}

const imageCacheSpec = {
  name: 'imageCache' + version,
  types: ['image'],
  urls: ['/bluewill.png'],
  strategy: 'CacheFirst',
};

cacheGenerator([pageCacheSpec, imageCacheSpec, staticCacheSpec]);//include your page/markup caches first