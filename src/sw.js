import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

console.log('Hello from SW Land!');

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);
