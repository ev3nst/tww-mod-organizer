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

    const profileFileName = `${profileName}.json`;
    const profileFilePath = path.join(modProfilePath, profileFileName);
    const modFiles = await retrieveModsMetaInformation();
    if (!fs.existsSync(profileFilePath)) {
        mkdripSync(modProfilePath);
        const defaultProfileData = modFiles.map((mf) => {
            return { id: mf.id, title: mf.title, active: true };
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
            const prevExsIndex = modFiles.findIndex((v) => v.id === row.id);
            if (prevExsIndex !== -1) {
                loadProfileDataResolved.push({
                    ...row,
                    title: modFiles[prevExsIndex].title,
                });
            }
        }

        for (let mfi = 0; mfi < modFiles.length; mfi++) {
            const mf = modFiles[mfi];
            // New mod added
            if (
                loadProfileDataResolved.findIndex((v) => v.id === mf.id) === -1
            ) {
                loadProfileDataResolved.push({
                    id: mf.id,
                    title: mf.title,
                    active: true,
                });
            }
        }

        fs.writeFileSync(
            profileFilePath,
            JSON.stringify(loadProfileDataResolved),
        );

        console.log(loadProfileDataResolved, 'loadProfileDataResolved');
        return loadProfileDataResolved;
    }
}

export default async function getModProfile() {
    ipcMain.handle('getModProfile', async (_e, profileName = 'default') => {
        return await retrieveModProfile(profileName);
    });
}
