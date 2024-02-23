import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    checkExistingMod: (arg) => ipcRenderer.invoke('game:checkExistingMod', arg),
    installMod: (...arg) => ipcRenderer.invoke('game:installMod', ...arg),
    getModFiles: () => ipcRenderer.invoke('game:modFiles'),
    getSaveFiles: (arg) => ipcRenderer.invoke('game:saveFiles', arg),
    deleteSaveFiles: (arg) => ipcRenderer.invoke('game:deleteSaveFiles', arg),
    steamUnsubscribe: (arg) =>
        ipcRenderer.invoke('steam:steamUnsubscribe', arg),
    deleteMod: (arg) => ipcRenderer.invoke('game:deleteMod', arg),
    dbGet: (arg) => ipcRenderer.invoke('db:get', arg),
    dbSet: (...arg) => ipcRenderer.invoke('db:set', ...arg),
    pathDirname: (arg) => ipcRenderer.invoke('path:dirname', arg),
    pathJoin: (...args) => ipcRenderer.invoke('path:join', ...args),
    appDataPath: () => ipcRenderer.invoke('electron:appData'),
    openExternalLink: (arg) => ipcRenderer.invoke('shell:externalLink', arg),
    showItemInFolder: (arg) =>
        ipcRenderer.invoke('shell:showItemInFolder', arg),
    fsExists: (arg) => ipcRenderer.invoke('fs:exists', arg),
    exit: () => ipcRenderer.invoke('electron:exit'),
});
