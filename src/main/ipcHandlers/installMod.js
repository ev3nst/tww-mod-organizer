import { app, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';
import { ulid } from 'ulid';

import db from '../db';
import dbKeys from '../db/keys';
import unzip from '../tools/unzip';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function installMod() {
    ipcMain.handle(
        'installMod',
        async (_e, modName, zipPath, sameNameAction) => {
            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const modInstallationFolder = resolveModInstallationPath();
            const modInstallationPath = path.join(
                modInstallationFolder,
                managedGame,
                modName,
            );
            const blankNewMeta = {
                id: ulid(),
                title: modName,
                version: '1.0',
            };

            if (!fs.existsSync(modInstallationPath)) {
                mkdripSync(modInstallationPath);
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

            if (sameNameAction === null) {
                const managedGame = db.get(dbKeys.MANAGED_GAME);
                const modProfilePath = path.join(
                    app.getPath('userData'),
                    'profiles',
                    managedGame,
                );

                const files = fs.readdirSync(modProfilePath);
                for (let fi = 0; fi < files.length; fi++) {
                    const filePath = path.join(modProfilePath, files[fi]);
                    if (filePath.endsWith('.txt')) {
                        const loadProfileDataRaw = fs.readFileSync(
                            filePath,
                            'utf-8',
                        );
                        const loadProfileData = JSON.parse(loadProfileDataRaw);
                        loadProfileData.push({
                            id: blankNewMeta.id,
                            active: true,
                        });

                        fs.writeFileSync(
                            filePath,
                            JSON.stringify(loadProfileData),
                        );
                    }
                }
            }

            await unzip(fs.readFileSync(zipPath), {
                to: modInstallationPath,
            });

            fs.writeFileSync(
                path.join(modInstallationPath, 'tww-mod-organizer.meta'),
                JSON.stringify(blankNewMeta),
            );

            return blankNewMeta;
        },
    );
}
