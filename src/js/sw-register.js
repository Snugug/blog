if ('serviceWorker' in navigator && import.meta.env.MODE !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
  });
}