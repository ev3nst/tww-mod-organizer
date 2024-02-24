import dbGet from './dbGet';
import dbSet from './dbSet';
import appDataPath from './appDataPath';
import electronExit from './electronExit';
import openExternalLink from './openExternalLink';
import fsExists from './fsExists';
import getAvailableModProfiles from './getAvailableModProfiles';
import checkExistingMod from './checkExistingMod';
import deleteMod from './deleteMod';
import deleteSaveFiles from './deleteSaveFiles';
import getDownloadedArchives from './getDownloadedArchives';
import installMod from './installMod';
import getModsMetaInformation from './getModsMetaInformation';
import getModProfile from './getModProfile';
import saveModProfile from './saveModProfile';
import setActiveMods from './setActiveMods';
import getSaveFiles from './getSaveFiles';
import createModProfile from './createModProfile';
import nexusInitAuth from './nexusInitAuth';
import pathDirname from './pathDirname';
import showItemInFolder from './showItemInFolder';
import steamUnsubscribe from './steamUnsubscribe';

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export default function ipcHandlers() {
    dbGet();
    dbSet();
    appDataPath();
    electronExit();
    openExternalLink();
    fsExists();
    getAvailableModProfiles();
    checkExistingMod();
    deleteMod();
    deleteSaveFiles();
    getDownloadedArchives();
    installMod();
    getModsMetaInformation();
    getModProfile();
    saveModProfile();
    setActiveMods();
    getSaveFiles();
    createModProfile();
    nexusInitAuth();
    pathDirname();
    showItemInFolder();
    steamUnsubscribe();
}
