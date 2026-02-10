// Service Worker for Zen Editor - disabled for chrome-extension URLs
// Chrome extensions don't support caching with chrome-extension:// scheme

console.log('Service Worker loaded (limited functionality for chrome-extension)');

self.addEventListener('install', () => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Fetch requests are handled by Chrome's default behavior for extensions
  // No custom caching for chrome-extension:// URLs
});
