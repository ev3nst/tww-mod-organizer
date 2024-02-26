import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import db from '../db';
import { retrieveModsMetaInformation } from './getModsMetaInformation';

export async function retrieveModProfile(profileName) {
    const managedGame = db.get(dbKeys.MANAGED_GAME);
    const modProfilePath = path.join(
        app.getPath('userData'),
        'profiles',
        managedGame,
    );

    const profileFileName = `${profileName}.txt`;
    const profileFilePath = path.join(modProfilePath, profileFileName);
    const modFiles = await retrieveModsMetaInformation();
    if (!fs.existsSync(profileFilePath)) {
        mkdripSync(modProfilePath);
        const defaultProfileData = modFiles.map((mf) => {
            return { id: mf.id, active: true };
        });
        fs.writeFileSync(profileFilePath, JSON.stringify(defaultProfileData));
        return defaultProfileData;
    } else {
        const loadProfileDataRaw = fs.readFileSync(profileFilePath, 'utf-8');
        const loadProfileData = JSON.parse(loadProfileDataRaw);
        let loadProfileDataResolved = [];

        for (let lpdi = 0; lpdi < loadProfileData.length; lpdi++) {
            const row = loadProfileData[lpdi];

            // Previously existed mod with given id does not exists
            if (modFiles.findIndex((v) => v.id === row.id) === -1) {
                loadProfileDataResolved = loadProfileDataResolved.filter(
                    function (obj) {
                        return obj.id === row.id;
                    },
                );
            } else {
                loadProfileDataResolved.push(row);
            }
        }

        for (let mfi = 0; mfi < modFiles.length; mfi++) {
            const mf = modFiles[mfi];
            // New mod added
            if (
                loadProfileDataResolved.findIndex((v) => v.id === mf.id) === -1
            ) {
                loadProfileDataResolved.push(mf);
            }
        }

        fs.writeFileSync(
            profileFilePath,
            JSON.stringify(loadProfileDataResolved),
        );

        return loadProfileDataResolved;
    }
}

export default async function getModProfile() {
    ipcMain.handle('getModProfile', async (_e, profileName = 'default') => {
        return await retrieveModProfile(profileName);
    });
}
