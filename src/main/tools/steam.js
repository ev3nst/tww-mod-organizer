import { app } from 'electron';
import winreg from 'winreg';
import fs from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

import { db } from '../db';
import dbKeys from '../db/keys';
import steamClient from './steamClient';
import supportedGames from '../../store/supportedGames';
import { arrayEquals } from '../../helpers/util';

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
                    db.set(dbKeys.STEAM_INSTALL_PATH, String(steamInstallPath));
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
                        db.set(
                            dbKeys.STEAM_INSTALL_PATH,
                            String(steamInstallPath),
                        );
                        resolveSteamLibraryPaths(steamInstallPath);
                    }
                }
            }
        });
    }
}

export function resolveSteamLibraryPaths(steamInstallPath) {
    const libraryMetaFile = path.join(
        steamInstallPath,
        'steamapps',
        'libraryfolders.vdf',
    );
    if (!fs.existsSync(libraryMetaFile)) {
        return;
    }

    const fileData = fs.readFileSync(libraryMetaFile, 'utf8');
    let libraryFolderPaths = [];
    const regex = /"(.*?)"/gm;
    const matches = fileData.match(regex);
    for (let mi = 0; mi < matches.length; mi++) {
        const match = matches[mi].replaceAll('"', '');
        if (match === 'path' && typeof matches[mi + 1] !== 'undefined') {
            const libPath = path.normalize(matches[mi + 1].replaceAll('"', ''));
            libraryFolderPaths.push(libPath);
        }
    }
    db.set(dbKeys.STEAM_LIBRARY_PATHS, libraryFolderPaths);

    let gameInstallPaths = {};
    for (let sgi = 0; sgi < supportedGames.length; sgi++) {
        const sg = supportedGames[sgi];
        gameInstallPaths[sg.slug] = '';
        for (let lfpi = 0; lfpi < libraryFolderPaths.length; lfpi++) {
            const libPath = libraryFolderPaths[lfpi];
            const gameInstallPath = path.join(
                libPath,
                'steamapps',
                'common',
                sg.steamFolderName,
            );

            if (
                fs.existsSync(path.join(gameInstallPath, `${sg.exeName}.exe`))
            ) {
                gameInstallPaths[sg.slug] = gameInstallPath;
                break;
            }
        }
    }

    db.set(dbKeys.GAME_INSTALL_PATHS, gameInstallPaths);
    return gameInstallPaths;
}

export function resolveSaveGamePaths() {
    const appDataPath = app.getPath('appData');
    let saveGamePaths = {};
    for (let sgi = 0; sgi < supportedGames.length; sgi++) {
        const sg = supportedGames[sgi];

        saveGamePaths[sg.slug] = path.join(
            appDataPath,
            'The Creative Assembly',
            sg.savePathFolder,
            'save_games',
        );
    }

    db.set(dbKeys.SAVE_GAME_PATHS, saveGamePaths);
    return saveGamePaths;
}

export async function getWorkshopMods() {
    const managedGame = db.get(dbKeys.MANAGED_GAME);
    const managedGameDetails = supportedGames.filter(
        (sgf) => sgf.slug === managedGame,
    )[0];

    const gameInstallationPaths = db.get(dbKeys.GAME_INSTALL_PATHS);
    const dbSubscribedModIds = db.get(dbKeys.STEAM_WORKSHOP_IDS);
    const dbSubscribedModDetails = db.get(dbKeys.STEAM_WORKSHOP_DETAILS);
    let subscribedModIds = await steamClient.getSubscribedItems(
        managedGameDetails.steamId,
    );

    let subscribedModIdsStr = subscribedModIds.map((id) => String(id));
    if (
        typeof dbSubscribedModIds === 'undefined' ||
        typeof dbSubscribedModIds[managedGame] === 'undefined' ||
        typeof dbSubscribedModDetails === 'undefined' ||
        typeof dbSubscribedModDetails[managedGame] === 'undefined' ||
        !arrayEquals(subscribedModIdsStr, dbSubscribedModIds[managedGame]) ||
        dbSubscribedModIds[managedGame].length !==
            dbSubscribedModDetails[managedGame].length
    ) {
        const saveIds = {
            ...dbSubscribedModIds,
            [managedGame]: subscribedModIdsStr,
        };
        db.set(dbKeys.STEAM_WORKSHOP_IDS, saveIds);

        const subscribedMods = await steamClient.getItems(
            managedGameDetails.steamId,
            subscribedModIds,
        );
        const workshopContentPath = path.resolve(
            gameInstallationPaths[managedGame],
            '../../workshop/content/' + managedGameDetails.steamId,
        );

        const subscribedModDetails = subscribedMods.map((sm) => {
            return {
                id: String(sm.publishedFileId),
                title: sm.title,
                description: sm.description,
                steamId: String(sm.publishedFileId),
                previewImage: sm.previewUrl,
                categories: sm.tags.filter((tag) => tag !== 'mod'),
                modPage: `https://steamcommunity.com/sharedfiles/filedetails/?id=${String(sm.publishedFileId)}`,
                createdAt: sm.timeCreated
                    ? new Date(sm.timeCreated * 1000)
                    : null,
                updatedAt: sm.timeUpdated
                    ? new Date(sm.timeUpdated * 1000)
                    : null,
            };
        });

        for (let smdi = 0; smdi < subscribedModDetails.length; smdi++) {
            const subscribedModDetail = subscribedModDetails[smdi];
            const doesNeedUpdate = await steamClient.state(
                managedGameDetails.steamId,
                subscribedModDetail.steamId,
            );

            if (doesNeedUpdate === 8) {
                await steamClient.updateItem(
                    managedGameDetails.steamId,
                    subscribedModDetail.steamId,
                );
            }

            const packFileName = (
                await readdir(
                    path.join(
                        workshopContentPath,
                        String(subscribedModDetail.id),
                    ),
                    { withFileTypes: true },
                )
            )
                .filter((dirent) => dirent.name.endsWith('.pack'))
                .map((dir) => dir.name);

            if (typeof packFileName[0] !== 'undefined') {
                subscribedModDetails[smdi].packFileName = packFileName[0];
            }
        }

        db.set(dbKeys.STEAM_WORKSHOP_DETAILS, {
            ...dbSubscribedModDetails,
            [managedGame]: subscribedModDetails,
        });

        return subscribedModDetails;
    }

    return dbSubscribedModDetails[managedGame];
}

export async function unsubscribeFromWorkshop(workshopItemId) {
    const managedGame = db.get(dbKeys.MANAGED_GAME);
    const managedGameDetails = supportedGames.filter(
        (sgf) => sgf.slug === managedGame,
    )[0];

    return await steamClient.unsubscribe(
        managedGameDetails.steamId,
        BigInt(workshopItemId),
    );
}
