import { ipcMain, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { ulid } from 'ulid';

import unzip from '../tools/unzip';
import { getModInstallationPath } from '../tools/resolveManagedPaths';

export default function gameInstallMod() {
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
}
