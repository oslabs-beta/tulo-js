import { cacheGenerator } from '/tulo.js';
const version = 2.0;

const imageCache = {
  name: 'imageCache' + version,
  types: ['image'],
  urls: ['/bluewill.png'],
  strategy: 'CacheFirst',
};

cacheGenerator([imageCache]);