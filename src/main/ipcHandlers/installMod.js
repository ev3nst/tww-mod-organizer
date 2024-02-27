import { app, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';
import { ulid } from 'ulid';
import { extractFileFromArchive } from '../tools/7z';

import db from '../db';
import dbKeys from '../db/keys';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function installMod() {
    ipcMain.handle(
        'installMod',
        async (_e, modName, zipPath, sameNameAction, packFileName) => {
            if (
                typeof packFileName === 'undefined' ||
                packFileName === null ||
                String(packFileName).length === 0
            ) {
                return;
            }

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

            try {
                if (!fs.existsSync(modInstallationPath)) {
                    mkdripSync(modInstallationPath);
                }

                if (sameNameAction === 'replace') {
                    const existingFiles = fs
                        .readdirSync(modInstallationPath)
                        .filter((fileName) => !fileName.endsWith('.meta'));

                    if (
                        typeof existingFiles !== 'undefined' &&
                        typeof existingFiles[0] !== 'undefined'
                    ) {
                        const existingFilePath = existingFiles[0];
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
                            const loadProfileData =
                                JSON.parse(loadProfileDataRaw);
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

                await extractFileFromArchive(
                    zipPath,
                    modInstallationPath,
                    packFileName,
                );

                fs.writeFileSync(
                    path.join(modInstallationPath, 'tww-mod-organizer.meta'),
                    JSON.stringify(blankNewMeta),
                );

                return blankNewMeta;
            } catch (e) {
                dialog.showErrorBox(
                    'Archive Error',
                    'Unexpected error when unzipping the archive.',
                );
                console.log(e);
                await shell.trashItem(modInstallationPath);
                return {
                    error: 'Could not read archive.',
                };
            }
        },
    );
}
