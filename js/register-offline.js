// Turns on playing offline (sw.js) on the published site. Not on this
// computer's test server (http://localhost), so changes show at once while
// working on the game. Browsers without this feature just play online.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js', { type: 'module' }).catch(() => {});
}
