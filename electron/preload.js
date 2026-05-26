// Preload script — runs in a sandboxed context before renderer
// Use contextBridge to expose safe APIs to the renderer if needed
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
});
