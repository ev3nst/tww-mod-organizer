import { dialog, ipcMain } from 'electron';

import db from '../db';
import dbKeys from '../db/keys';
import axios from 'axios';

export default function getNexusDownloadLink() {
    ipcMain.handle('getNexusDownloadLink', async (_e, requestOptions) => {
        const nexusAPIKey = db.get(dbKeys.NEXUS_API_KEY);
        if (
            typeof nexusAPIKey === 'undefined' ||
            nexusAPIKey === null ||
            String(nexusAPIKey).length === 0
        ) {
            dialog.showErrorBox(
                'Nexus Error',
                'App doesnt have any authentication token. You need to login Nexus Mods using this app.',
            );

            return false;
        }

        if (
            typeof requestOptions === 'undefined' ||
            typeof requestOptions.gameDomainName === 'undefined' ||
            typeof requestOptions.fileId === 'undefined' ||
            typeof requestOptions.modId === 'undefined' ||
            typeof requestOptions.downloadKey === 'undefined' ||
            typeof requestOptions.downloadExpires === 'undefined'
        ) {
            dialog.showErrorBox(
                'Download Error',
                'App could not parse given download link.',
            );

            return false;
        }

        const baseURL = 'https://api.nexusmods.com';
        const requestDownloadUrlEndpoint = `/v1/games/${requestOptions.gameDomainName}/mods/${requestOptions.modId}/files/${requestOptions.fileId}/download_link.json`;
        const response = await axios.get(
            `${baseURL}${requestDownloadUrlEndpoint}`,
            {
                headers: {
                    apiKey: nexusAPIKey,
                },
                params: {
                    key: requestOptions.downloadKey,
                    expires: requestOptions.downloadExpires,
                },
            },
        );

        if (
            typeof response !== 'undefined' &&
            typeof response.data !== 'undefined' &&
            typeof response.data[0] !== 'undefined' &&
            typeof response.data[0].URI !== 'undefined'
        ) {
            return response.data[0].URI;
        } else {
            dialog.showErrorBox('Nexus Error', JSON.stringify(response));
            return false;
        }
    });
}
