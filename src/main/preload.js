import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    dbGet: (arg) => ipcRenderer.invoke('db:get', arg),
    dbSet: (...arg) => ipcRenderer.invoke('db:set', ...arg),
    pathDirname: (arg) => ipcRenderer.invoke('path:dirname', arg),
    pathJoin: (...args) => ipcRenderer.invoke('path:join', ...args),
    appDataPath: () => ipcRenderer.invoke('electron:appData'),
    exit: () => ipcRenderer.invoke('electron:exit'),
});
