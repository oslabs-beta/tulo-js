import { cacheGenerator } from '/tulo.js';
const version = 1.0;

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
  strategy: 'CacheFirst'
}

const imageCache = {
  name: 'imageCache' + version,
  types: ['image'],
  urls: ['/bluewill.png'],
  strategy: 'CacheFirst',
};

cacheGenerator([imageCache, staticCache, pageCache]);