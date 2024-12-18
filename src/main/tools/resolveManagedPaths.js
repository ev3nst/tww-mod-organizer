import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import { db } from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';

export function resolveModInstallationPath() {
    let modInstallationPath = db.get(dbKeys.MOD_INSTALLATION_FOLDER);
    if (!modInstallationPath) {
        modInstallationPath = path.join(app.getPath('userData'), 'mods');
        db.set(dbKeys.MOD_INSTALLATION_FOLDER, modInstallationPath);
    }

    if (!fs.existsSync(modInstallationPath)) {
        mkdripSync(modInstallationPath);
    }

    return modInstallationPath;
}

export function resolveManagedPaths() {
    let modDownloadPath = db.get(dbKeys.MOD_DOWNLOAD_FOLDER);
    if (
        typeof modDownloadPath === 'undefined' ||
        String(modDownloadPath).length === 0
    ) {
        modDownloadPath = path.join(app.getPath('userData'), 'downloads');
        db.set(dbKeys.MOD_DOWNLOAD_FOLDER, modDownloadPath);
    }

    const modInstallationFolder = resolveModInstallationPath();
    if (!fs.existsSync(modInstallationFolder)) {
        mkdripSync(modInstallationFolder);
    }

    const modProfilesPath = path.join(app.getPath('userData'), 'profiles');
    for (let sgi = 0; sgi < supportedGames.length; sgi++) {
        const sg = supportedGames[sgi];
        const gameSpecificDownloadFolder = path.join(modDownloadPath, sg.slug);
        if (!fs.existsSync(gameSpecificDownloadFolder)) {
            mkdripSync(gameSpecificDownloadFolder);
        }

        const gameSpecificModProfile = path.join(modProfilesPath, sg.slug);
        if (!fs.existsSync(gameSpecificModProfile)) {
            mkdripSync(gameSpecificModProfile);
        }
    }
}
