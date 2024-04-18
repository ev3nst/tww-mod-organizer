import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

import { db } from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';

export default function startGame() {
    ipcMain.handle(
        'startGame',
        (_e, modProfileData, modListData, saveGame = null) => {
            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const managedGameDetails = supportedGames.filter(
                (sgf) => sgf.slug === managedGame,
            )[0];
            const gameInstallationPaths = db.get(dbKeys.GAME_INSTALL_PATHS);
            const modInstallationPaths = db.get(dbKeys.MOD_INSTALLATION_FOLDER);
            const currentGameModPath = path.join(
                modInstallationPaths,
                managedGameDetails.slug,
            );

            const reverseLoadOrder = modProfileData.slice().reverse();
            const currentGamePath = gameInstallationPaths[managedGame];
            let addDirectoryTxt = '';
            let usedModsTxt = '';
            for (let mpdi = 0; mpdi < reverseLoadOrder.length; mpdi++) {
                const modProfData = reverseLoadOrder[mpdi];
                if (modProfData.active === true) {
                    const modFileDetail = modListData.filter(
                        (mlf) => mlf.id === modProfData.id,
                    )[0];

                    if (typeof modFileDetail.steamId !== 'undefined') {
                        const workshopContentPath = path.resolve(
                            gameInstallationPaths[managedGame],
                            '../../workshop/content/',
                        );

                        const workshopModPath = path.join(
                            workshopContentPath,
                            String(managedGameDetails.steamId),
                            String(modFileDetail.steamId),
                        );
                        addDirectoryTxt += `add_working_directory "${workshopModPath.replaceAll('\\', '/')}";\n`;
                        usedModsTxt += `mod "${modFileDetail.packFileName}";\n`;
                    } else {
                        const manualModPath = path.join(
                            currentGameModPath,
                            modFileDetail.title,
                        );
                        addDirectoryTxt += `add_working_directory "${manualModPath.replaceAll('\\', '/')}";\n`;
                        usedModsTxt += `mod "${modFileDetail.packFileName}";\n`;
                    }
                }
            }

            fs.writeFileSync(
                `${currentGamePath}\\used_mods.txt`,
                addDirectoryTxt + usedModsTxt,
            );

            let startGameCommand = `start /d "${currentGamePath}" ${managedGameDetails.exeName}.exe`;
            if (saveGame) {
                startGameCommand += ` game_startup_mode campaign_load ${saveGame};`;
            }

            startGameCommand += ` used_mods.txt;`;
            exec(startGameCommand);
        },
    );
}
