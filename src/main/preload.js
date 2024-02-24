import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    nexusInitAuth: () => ipcRenderer.invoke('nexus:init_auth'),

    checkExistingMod: (modName) =>
        ipcRenderer.invoke('game:checkExistingMod', modName),

    installMod: (modName, zipPath, sameNameAction) =>
        ipcRenderer.invoke('game:installMod', modName, zipPath, sameNameAction),

    getModFiles: () => ipcRenderer.invoke('game:modFiles'),

    saveModOrder: (newOrder, profileName) =>
        ipcRenderer.invoke('game:saveModOrder', newOrder, profileName),

    getModOrder: (profileName) =>
        ipcRenderer.invoke('game:modOrder', profileName),

    getSaveFiles: () => ipcRenderer.invoke('game:saveFiles'),

    deleteSaveFiles: (saveFilePaths) =>
        ipcRenderer.invoke('game:deleteSaveFiles', saveFilePaths),

    steamUnsubscribe: (workshopItemId) =>
        ipcRenderer.invoke('steam:unsubscribe', workshopItemId),

    deleteMod: (modName) => ipcRenderer.invoke('game:deleteMod', modName),

    getDownloadedArchives: () => ipcRenderer.invoke('game:downloadedFiles'),

    dbGet: (key) => ipcRenderer.invoke('db:get', key),

    dbSet: (key, value) => ipcRenderer.invoke('db:set', key, value),

    pathDirname: (arg) => ipcRenderer.invoke('path:dirname', arg),

    pathJoin: (...pathStrings) =>
        ipcRenderer.invoke('path:join', ...pathStrings),

    appDataPath: () => ipcRenderer.invoke('electron:appData'),

    openExternalLink: (url) => ipcRenderer.invoke('shell:externalLink', url),

    showItemInFolder: (pathString) =>
        ipcRenderer.invoke('shell:showItemInFolder', pathString),

    fsExists: (pathString) => ipcRenderer.invoke('fs:exists', pathString),

    exit: () => ipcRenderer.invoke('electron:exit'),
});
