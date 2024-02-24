import { app } from 'electron';
import winreg from 'winreg';
import fs from 'fs';
import path from 'path';
import steamworks from 'steamworks.js';

import db from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';

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

    resolveSaveGamePaths();
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

    const dbSubscribedModIds = db.get(dbKeys.STEAM_WORKSHOP_IDS);
    const dbSubscribedModDetails = db.get(dbKeys.STEAM_WORKSHOP_DETAILS);

    const client = steamworks.init(managedGameDetails.steamId);
    const subscribedModIds = client.workshop.getSubscribedItems();
    if (
        typeof dbSubscribedModIds === 'undefined' ||
        typeof dbSubscribedModIds[managedGame] === 'undefined' ||
        typeof dbSubscribedModDetails === 'undefined' ||
        typeof dbSubscribedModDetails[managedGame] === 'undefined' ||
        subscribedModIds.sort().toString() !==
            dbSubscribedModIds[managedGame].sort().toString()
    ) {
        db.set(dbKeys.STEAM_WORKSHOP_IDS, {
            ...dbSubscribedModIds,
            [managedGame]: subscribedModIds,
        });

        const subscribedMods = await client.workshop.getItems(subscribedModIds);
        const subscribedModDetails = subscribedMods.map((sm) => {
            return {
                id: sm.publishedFileId,
                title: sm.title,
                description: sm.description,
                steamId: sm.publishedFileId,
                previewImage: sm.previewUrl,
                categories: sm.tags.filter((tag) => tag !== 'mod'),
                modPage: `https://steamcommunity.com/sharedfiles/filedetails/?id=${sm.publishedFileId}`,
                createdAt: sm.timeCreated
                    ? new Date(sm.timeCreated * 1000)
                    : null,
                updatedAt: sm.timeUpdated
                    ? new Date(sm.timeUpdated * 1000)
                    : null,
            };
        });

        db.set(dbKeys.STEAM_WORKSHOP_DETAILS, {
            ...dbSubscribedModDetails,
            [managedGame]: subscribedModDetails,
        });
        return subscribedMods;
    }

    return dbSubscribedModDetails[managedGame];
}

export async function unsubscribeFromWorkshop(workshopItemId) {
    const managedGame = db.get(dbKeys.MANAGED_GAME);
    const managedGameDetails = supportedGames.filter(
        (sgf) => sgf.slug === managedGame,
    )[0];

    const client = steamworks.init(managedGameDetails.steamId);
    return await client.workshop.unsubscribe(BigInt(workshopItemId));
}
