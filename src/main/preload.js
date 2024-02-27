import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    nexusInitAuth: () => ipcRenderer.invoke('nexusInitAuth'),

    checkExistingMod: (modName) =>
        ipcRenderer.invoke('checkExistingMod', modName),

    checkModZipFiles: (zipPath) =>
        ipcRenderer.invoke('checkModZipFiles', zipPath),

    installMod: (modName, zipPath, sameNameAction, packFileName) =>
        ipcRenderer.invoke(
            'installMod',
            modName,
            zipPath,
            sameNameAction,
            packFileName,
        ),

    getModsMetaInformation: () => ipcRenderer.invoke('getModsMetaInformation'),

    getModProfile: (profileName) =>
        ipcRenderer.invoke('getModProfile', profileName),

    getAvailableModProfiles: () =>
        ipcRenderer.invoke('getAvailableModProfiles'),

    saveModProfile: (profileName, modProfileData) =>
        ipcRenderer.invoke('saveModProfile', profileName, modProfileData),

    createModProfile: (profileName, modProfileData) =>
        ipcRenderer.invoke('createModProfile', profileName, modProfileData),

    deleteModProfile: (profileName) =>
        ipcRenderer.invoke('deleteModProfile', profileName),

    setActiveMods: (modIds) => ipcRenderer.invoke('setActiveMods', modIds),

    getSaveFiles: () => ipcRenderer.invoke('getSaveFiles'),

    deleteSaveFiles: (saveFilePaths) =>
        ipcRenderer.invoke('deleteSaveFiles', saveFilePaths),

    steamUnsubscribe: (workshopItemId) =>
        ipcRenderer.invoke('steamUnsubscribe', workshopItemId),

    deleteMod: (modDetails) => ipcRenderer.invoke('deleteMod', modDetails),

    getDownloadedArchives: () => ipcRenderer.invoke('getDownloadedArchives'),

    getModConflicts: () => ipcRenderer.invoke('getModConflicts'),

    dbGet: (key) => ipcRenderer.invoke('dbGet', key),

    dbSet: (key, value) => ipcRenderer.invoke('dbSet', key, value),

    pathDirname: (arg) => ipcRenderer.invoke('pathDirname', arg),

    openExternalLink: (url) => ipcRenderer.invoke('openExternalLink', url),

    showItemInFolder: (pathString) =>
        ipcRenderer.invoke('showItemInFolder', pathString),

    fsExists: (pathString) => ipcRenderer.invoke('fsExists', pathString),
});
