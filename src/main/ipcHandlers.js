import { app, dialog, ipcMain, remote, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { sync as mkdripSync } from 'mkdirp';
import { ulid } from 'ulid';
import db from './db';
import dbKeys from './dbKeys';
import unzip from './unzip';
import {
    getWorkshopMods,
    resolveSaveGamePaths,
    unsubscribeFromWorkshop,
} from './steam';

BigInt.prototype.toJSON = function () {
    return this.toString();
};

function getModInstallationPath() {
    let modInstallationPath = db.get(dbKeys.MOD_INSTALLATION_FOLDER);
    if (!modInstallationPath) {
        modInstallationPath = path.join(app.getPath('userData'), 'mods');
        db.set(dbKeys.MOD_INSTALLATION_FOLDER, modInstallationPath);
    }

    if (!fs.existsSync(modInstallationPath)) {
        fs.mkdirSync(modInstallationPath);
    }

    return modInstallationPath;
}

function ipcHandlers() {
    ipcMain.handle('shell:externalLink', (_e, url) => {
        shell.openExternal(url);
    });

    ipcMain.handle('path:dirname', (_e, pathString) => {
        return path.dirname(pathString);
    });

    ipcMain.handle('path:join', (_e, ...args) => {
        return path.join(args);
    });

    ipcMain.handle('electron:appData', () => {
        return app.getPath('appData');
    });

    ipcMain.handle('electron:exit', () => {
        remote.getCurrentWindow().close();
    });

    ipcMain.handle('db:get', (_e, key) => {
        if (Object.values(dbKeys).includes(key)) {
            return db.get(key);
        }
    });

    ipcMain.handle('db:set', (_e, key, value) => {
        if (Object.values(dbKeys).includes(key)) {
            return db.set(key, value);
        }
    });

    ipcMain.handle('fs:exists', (_e, pathString) => {
        return fs.existsSync(pathString);
    });

    ipcMain.handle('game:downloadedFiles', (managedGameFallback) => {
        let downloadFiles = [];
        let managedGame = db.get(dbKeys.MANAGED_GAME);
        if (!managedGame) {
            managedGame = managedGameFallback;
        }

        let modDownloadPaths = db.get(dbKeys.MOD_DOWNLOAD_FOLDER);
        let modDownloadPath;
        if (
            typeof modDownloadPaths === 'undefined' ||
            typeof modDownloadPaths[managedGame] === 'undefined'
        ) {
            modDownloadPath = path.join(
                app.getPath('userData'),
                'downloads',
                managedGame,
            );
            db.set(dbKeys.MOD_DOWNLOAD_FOLDER, {
                ...modDownloadPaths,
                [managedGame]: modDownloadPath,
            });
        } else {
            modDownloadPath = modDownloadPaths[managedGame];
        }

        if (!fs.existsSync(modDownloadPath)) {
            mkdripSync(modDownloadPath);
            return [];
        }

        const files = fs.readdirSync(modDownloadPath);
        for (let fi = 0; fi < files.length; fi++) {
            const filePath = path.join(modDownloadPath, files[fi]);
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
    });

    ipcMain.handle('game:saveFiles', (managedGameFallback) => {
        let managedGame = db.get(dbKeys.MANAGED_GAME);
        if (!managedGame) {
            managedGame = managedGameFallback;
        }

        let saveGamePaths = db.get(dbKeys.SAVE_GAME_PATHS);
        if (saveGamePaths.length === 0) {
            saveGamePaths = resolveSaveGamePaths();
        }

        let saveGameFiles = [];
        if (typeof saveGamePaths[managedGame] !== 'undefined') {
            const saveGamePath = saveGamePaths[managedGame];
            if (!fs.existsSync(saveGamePath)) {
                return [];
            }

            const files = fs.readdirSync(saveGamePath);
            for (let fi = 0; fi < files.length; fi++) {
                const filePath = path.join(saveGamePath, files[fi]);
                if (filePath.endsWith('.save')) {
                    const stat = fs.lstatSync(filePath);
                    saveGameFiles.push({
                        name: files[fi],
                        size: stat.size,
                        date: stat.mtime,
                        path: filePath,
                    });
                }
            }
        }

        return saveGameFiles;
    });

    ipcMain.handle('game:deleteSaveFiles', async (_e, saveFilePaths) => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const saveGamePaths = db.get(dbKeys.SAVE_GAME_PATHS);
        for (let sfpi = 0; sfpi < saveFilePaths.length; sfpi++) {
            const saveFilePath = saveFilePaths[sfpi];
            if (!saveFilePath.endsWith('.save')) {
                return;
            }

            await shell.trashItem(
                path.join(saveGamePaths[managedGame], saveFilePath),
            );
        }
    });

    ipcMain.handle('shell:showItemInFolder', (_e, pathString) => {
        shell.showItemInFolder(pathString);
    });

    ipcMain.handle('game:checkExistingMod', (_e, modName) => {
        const modInstallationFolder = getModInstallationPath();
        const modInstallationPath = path.join(modInstallationFolder, modName);
        return fs.existsSync(modInstallationPath);
    });

    ipcMain.handle(
        'game:installMod',
        async (_e, modName, zipPath, sameNameAction) => {
            const modInstallationFolder = getModInstallationPath();
            const modInstallationPath = path.join(
                modInstallationFolder,
                modName,
            );
            try {
                if (!fs.existsSync(modInstallationPath)) {
                    fs.mkdirSync(modInstallationPath);
                }

                if (sameNameAction === 'replace') {
                    const existingFiles = fs
                        .readdirSync(modInstallationPath)
                        .filter((fileName) => !fileName.endsWith('.meta'));
                    for (let efi = 0; efi < existingFiles.length; efi++) {
                        const existingFilePath = existingFiles[efi];
                        await shell.trashItem(
                            path.join(modInstallationPath, existingFilePath),
                        );
                    }
                }

                await unzip(fs.readFileSync(zipPath), {
                    to: modInstallationPath,
                });
            } catch (e) {
                console.warn(e);
                dialog.showErrorBox(
                    'Bad Archive',
                    'Unfortunately this archive cannot be extracted using this application. ZIP file must be incorrectly made or corrupt. You can try to extract the contents manually into the mods folder. Mods folder can be viewed with options menu.',
                );
            }

            const blankNewMeta = {
                id: ulid(),
                title: modName,
                version: '1.0',
            };

            fs.writeFileSync(
                path.join(modInstallationPath, 'tww-mod-organizer.meta'),
                JSON.stringify(blankNewMeta),
            );

            return blankNewMeta;
        },
    );

    ipcMain.handle('game:modFiles', async () => {
        const steamWorkshopMods = await getWorkshopMods();
        let manuallyInstalledMods = [];
        const modInstallationFolder = getModInstallationPath();
        const directories = (
            await readdir(modInstallationFolder, { withFileTypes: true })
        )
            .filter((dirent) => dirent.isDirectory())
            .map((dir) => dir.name);

        for (let di = 0; di < directories.length; di++) {
            const dir = directories[di];
            const metaDataPath = path.join(
                modInstallationFolder,
                dir,
                'tww-mod-organizer.meta',
            );
            const blankNewMeta = {
                id: ulid(),
                title: dir,
                version: '1.0',
            };
            if (!fs.existsSync(metaDataPath)) {
                manuallyInstalledMods.push(blankNewMeta);
                fs.writeFileSync(metaDataPath, JSON.stringify(blankNewMeta));
            } else {
                const modMetaTextData = fs.readFileSync(metaDataPath, 'utf8');
                let modMeta;
                try {
                    modMeta = JSON.parse(modMetaTextData);
                } catch (e) {
                    console.warn(e);
                }

                if (!modMeta) {
                    manuallyInstalledMods.push(blankNewMeta);
                    fs.writeFileSync(
                        metaDataPath,
                        JSON.stringify(blankNewMeta),
                    );
                } else {
                    manuallyInstalledMods.push(modMeta);
                }
            }
        }

        const modFiles = [...steamWorkshopMods, ...manuallyInstalledMods];
        return modFiles;
    });

    ipcMain.handle('game:deleteMod', async (_e, title) => {
        const modInstallationFolder = getModInstallationPath();
        const modPath = path.join(modInstallationFolder, title);
        if (fs.existsSync(modPath)) {
            await shell.trashItem(modPath);
        }
    });

    ipcMain.handle('steam:steamUnsubscribe', async (_e, workshopItemId) => {
        await unsubscribeFromWorkshop(workshopItemId);
    });
}

export default ipcHandlers;
