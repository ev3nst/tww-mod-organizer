import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import db from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';

export default function getDownloadedArchives() {
    ipcMain.handle('getDownloadedArchives', () => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        let downloadFiles = [];
        let modDownloadPath = db.get(dbKeys.MOD_DOWNLOAD_FOLDER);
        if (
            typeof modDownloadPath === 'undefined' ||
            String(modDownloadPath).length === 0
        ) {
            modDownloadPath = path.join(app.getPath('userData'), 'downloads');
            db.set(dbKeys.MOD_DOWNLOAD_FOLDER, modDownloadPath);
        }

        for (let sgi = 0; sgi < supportedGames.length; sgi++) {
            const sg = supportedGames[sgi];
            const gameSpecificDownloadFolder = path.join(
                modDownloadPath,
                sg.slug,
            );
            if (!fs.existsSync(gameSpecificDownloadFolder)) {
                mkdripSync(gameSpecificDownloadFolder);
            }
        }

        const modDownloadPathForGame = path.join(modDownloadPath, managedGame);
        const files = fs.readdirSync(modDownloadPathForGame);
        for (let fi = 0; fi < files.length; fi++) {
            const filePath = path.join(modDownloadPathForGame, files[fi]);
            if (
                filePath.endsWith('.zip') ||
                filePath.endsWith('.7z') ||
                filePath.endsWith('.rar')
            ) {
                const stat = fs.lstatSync(filePath);
                downloadFiles.push({
                    name: files[fi],
                    size: stat.size,
                    date: stat.mtime,
                    path: filePath,
                });
            }
        }

        return downloadFiles;
    });
}
