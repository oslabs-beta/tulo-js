import { cacheGenerator } from '/tulo.js';
const version = 2.0;

const pageCache = {
  name: 'pageCache'+version,
  types: ['text/html'],
  urls: ['/', '/index.html'],
  strategy: 'NetworkFirst'
}

const staticCache = {
  name: 'staticCache'+version,
  types: ['text/css'],
  urls: ['/styles.css'],
  strategy: 'CacheFirst',
  expiration: 60*1000//in miliseconds
}

const imageCache = {
  name: 'imageCache' + version,
  types: ['image'],
  urls: ['/bluewill.png'],
  strategy: 'CacheFirst',
};

cacheGenerator([pageCache, imageCache, staticCache]);