const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('domainAPI', {
  getTlds: () => ipcRenderer.invoke('get-tlds'),
  scanWord: (word, tlds) => ipcRenderer.invoke('scan-word', word, tlds),
  premiumSearch: options => ipcRenderer.invoke('premium-search', options),
  openExternal: url => ipcRenderer.invoke('open-external', url)
});
