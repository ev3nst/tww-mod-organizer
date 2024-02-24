import dbGet from './dbGet';
import dbSet from './dbSet';
import electronAppData from './electronAppData';
import electronExit from './electronExit';
import externalLink from './externalLink';
import fsExists from './fsExists';
import gameCheckExistingMod from './gameCheckExistingMod';
import gameDeleteMod from './gameDeleteMod';
import gameDeleteSaveFiles from './gameDeleteSaveFiles';
import gameDownloadedFiles from './gameDownloadedFiles';
import gameInstallMod from './gameInstallMod';
import gameModFiles from './gameModFiles';
import gameSaveFiles from './gameSaveFiles';
import nexusInitAuth from './nexusInitAuth';
import pathDirname from './pathDirname';
import pathJoin from './pathJoin';
import showItemInFolder from './showItemInFolder';
import steamUnsubscribe from './steamUnsubscribe';

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export default function ipcHandlers() {
    dbGet();
    dbSet();
    electronAppData();
    electronExit();
    externalLink();
    fsExists();
    gameCheckExistingMod();
    gameDeleteMod();
    gameDeleteSaveFiles();
    gameDownloadedFiles();
    gameInstallMod();
    gameModFiles();
    gameSaveFiles();
    nexusInitAuth();
    pathDirname();
    pathJoin();
    showItemInFolder();
    steamUnsubscribe();
}
