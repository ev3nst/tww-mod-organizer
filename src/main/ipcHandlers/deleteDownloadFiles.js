import { ipcMain, shell } from 'electron';
import path from 'path';

import db from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';

export default function deleteDownloadFiles() {
    ipcMain.handle('deleteDownloadFiles', async (_e, deleteFilePaths) => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const downloadPaths = db.get(dbKeys.MOD_DOWNLOAD_FOLDER);
        const managedGameDetails = supportedGames.filter(
            (sgf) => sgf.slug === managedGame,
        )[0];
        const gameSpecificDownloadPath = path.join(
            downloadPaths,
            managedGameDetails.slug,
        );

        for (let sfpi = 0; sfpi < deleteFilePaths.length; sfpi++) {
            const downloadFilePath = deleteFilePaths[sfpi];
            if (
                downloadFilePath.endsWith('.zip') ||
                downloadFilePath.endsWith('.7z') ||
                downloadFilePath.endsWith('.rar')
            ) {
                await shell.trashItem(
                    path.join(gameSpecificDownloadPath, downloadFilePath),
                );
            }
        }
    });
}
