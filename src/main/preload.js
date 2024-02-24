import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    nexusInitAuth: () => ipcRenderer.invoke('nexusInitAuth'),

    checkExistingMod: (modName) =>
        ipcRenderer.invoke('checkExistingMod', modName),

    installMod: (modName, zipPath, sameNameAction) =>
        ipcRenderer.invoke('installMod', modName, zipPath, sameNameAction),

    getModFiles: () => ipcRenderer.invoke('getModFiles'),

    getModProfile: (profileName) =>
        ipcRenderer.invoke('getModProfile', profileName),

    getAvailableModProfiles: () =>
        ipcRenderer.invoke('getAvailableModProfiles'),

    saveModProfile: (profileName, modOrder) =>
        ipcRenderer.invoke('saveModProfile', profileName, modOrder),

    createModProfile: (profileName, modOrder) =>
        ipcRenderer.invoke('createModProfile', profileName, modOrder),

    getSaveFiles: () => ipcRenderer.invoke('getSaveFiles'),

    deleteSaveFiles: (saveFilePaths) =>
        ipcRenderer.invoke('deleteSaveFiles', saveFilePaths),

    steamUnsubscribe: (workshopItemId) =>
        ipcRenderer.invoke('steamUnsubscribe', workshopItemId),

    deleteMod: (modName) => ipcRenderer.invoke('deleteMod', modName),

    getDownloadedArchives: () => ipcRenderer.invoke('getDownloadedArchives'),

    dbGet: (key) => ipcRenderer.invoke('dbGet', key),

    dbSet: (key, value) => ipcRenderer.invoke('dbSet', key, value),

    pathDirname: (arg) => ipcRenderer.invoke('pathDirname', arg),

    appDataPath: () => ipcRenderer.invoke('appDataPath'),

    openExternalLink: (url) => ipcRenderer.invoke('openExternalLink', url),

    showItemInFolder: (pathString) =>
        ipcRenderer.invoke('showItemInFolder', pathString),

    fsExists: (pathString) => ipcRenderer.invoke('fsExists', pathString),

    electronExit: () => ipcRenderer.invoke('electronExit'),
});
