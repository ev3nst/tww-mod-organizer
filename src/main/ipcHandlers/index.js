import dbGet from './dbGet';
import dbSet from './dbSet';
import openExternalLink from './openExternalLink';
import fsExists from './fsExists';
import checkPaths from './checkPaths';
import getAvailableModProfiles from './getAvailableModProfiles';
import checkExistingMod from './checkExistingMod';
import checkModZipFiles from './checkModZipFiles';
import deleteMod from './deleteMod';
import deleteSaveFiles from './deleteSaveFiles';
import getDownloadedArchives from './getDownloadedArchives';
import deleteDownloadFiles from './deleteDownloadFiles';
import installMod from './installMod';
import getModsMetaInformation from './getModsMetaInformation';
import getModProfile from './getModProfile';
import saveModProfile from './saveModProfile';
import setActiveMods from './setActiveMods';
import getSaveFiles from './getSaveFiles';
import createModProfile from './createModProfile';
import deleteModProfile from './deleteModProfile';
import nexusInitAuth from './nexusInitAuth';
import getNexusDownloadLink from './getNexusDownloadLink';
import checkExistingDownload from './checkExistingDownload';
import streamDownload from './streamDownload';
import pathDirname from './pathDirname';
import showItemInFolder from './showItemInFolder';
import steamUnsubscribe from './steamUnsubscribe';
import getModConflicts from './getModConflicts';
import startGame from './startGame';

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export default function ipcHandlers() {
    dbGet();
    dbSet();
    openExternalLink();
    fsExists();
    checkPaths();
    getAvailableModProfiles();
    checkExistingMod();
    checkModZipFiles();
    deleteMod();
    deleteSaveFiles();
    getDownloadedArchives();
    deleteDownloadFiles();
    installMod();
    getModsMetaInformation();
    getModProfile();
    saveModProfile();
    setActiveMods();
    getSaveFiles();
    createModProfile();
    deleteModProfile();
    nexusInitAuth();
    getNexusDownloadLink();
    checkExistingDownload();
    streamDownload();
    pathDirname();
    showItemInFolder();
    steamUnsubscribe();
    getModConflicts();
    startGame();
}
