import { app } from 'electron';
import winreg from 'winreg';
import fs from 'fs';
import path from 'path';

import db from './db';
import { supportedGames } from '../store/constants';

export function resolveSteamPaths() {
    let steamInstallPath = null;
    const steamRegKey = new winreg({
        hive: winreg.HKCU,
        key: '\\SOFTWARE\\Valve\\Steam',
    });
    const steamRegKey64 = new winreg({
        hive: winreg.HKCU,
        key: '\\SOFTWARE\\Wow6432Node\\Valve\\Steam',
    });
    steamRegKey.values(function (err, steamRegItems) {
        if (!err) {
            for (let srii = 0; srii < steamRegItems.length; srii++) {
                if (String(steamRegItems[srii].name) === 'SteamPath') {
                    steamInstallPath = steamRegItems[srii].value;
                    db.set('steamInstallPath', String(steamInstallPath));

                    resolveSteamLibraryPaths(steamInstallPath);
                }
            }
        }
    });

    if (steamInstallPath === null) {
        steamRegKey64.values(function (err, steamReg64Items) {
            if (!err) {
                for (
                    let sr64ii = 0;
                    sr64ii < steamReg64Items.length;
                    sr64ii++
                ) {
                    if (String(steamReg64Items[sr64ii].name) === 'SteamPath') {
                        steamInstallPath = steamReg64Items[sr64ii].value;
                        db.set('steamInstallPath', String(steamInstallPath));
                        resolveSteamLibraryPaths(steamInstallPath);
                    }
                }
            }
        });
    }
}

export function resolveSteamLibraryPaths(steamInstallPath) {
    fs.readFile(
        `${steamInstallPath}\\steamapps\\libraryfolders.vdf`,
        'utf8',
        (err, data) => {
            if (!err) {
                let libraryFolderPaths = [];
                const regex = /"(.*?)"/gm;
                const matches = data.match(regex);
                for (let mi = 0; mi < matches.length; mi++) {
                    const match = matches[mi].replaceAll('"', '');
                    if (
                        match === 'path' &&
                        typeof matches[mi + 1] !== 'undefined'
                    ) {
                        const libPath = path.normalize(
                            matches[mi + 1].replaceAll('"', ''),
                        );
                        libraryFolderPaths.push(libPath);
                    }
                }
                db.set('steamLibraryPaths', libraryFolderPaths);
            }
        },
    );
}

export async function resolveSaveFiles() {
    const appDataPath = app.getPath('appData');
    console.log(appDataPath, 'APP DATA');
    let saveGamePaths = {};
    for (let sgi = 0; sgi < supportedGames.length; sgi++) {
        const sg = supportedGames[sgi];
        saveGamePaths[sg.slug] =
            `${appDataPath}\\The Creative Assembly\\${sg.savePathFolder}\\save_games`;
    }

    db.set('saveGamePaths', saveGamePaths);

    let saveGameFiles = {};
    for (const gameSlug in saveGamePaths) {
        saveGameFiles[gameSlug] = [];
        if (Object.hasOwnProperty.call(saveGamePaths, gameSlug)) {
            const saveGamePath = saveGamePaths[gameSlug];

            if (!fs.existsSync(saveGamePath)) {
                return;
            }

            const files = fs.readdirSync(saveGamePath);
            for (let fi = 0; fi < files.length; fi++) {
                const filename = path.join(saveGamePath, files[fi]);
                if (filename.endsWith('.save')) {
                    const stat = fs.lstatSync(filename);
                    saveGameFiles[gameSlug].push({
                        fileName: files[fi],
                        stat,
                    });
                }
            }
        }
    }

    db.set('saveGameFiles', saveGameFiles);
}
