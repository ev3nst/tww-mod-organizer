import { dialog, ipcMain } from 'electron';

import WebSocket from 'ws';
import db from '../db';
import dbKeys from '../db/keys';

export default function getNexusDownloadLink() {
    ipcMain.handle('getNexusDownloadLink', async (requestOptions) => {
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

        return;
        const nexusWSHost = 'wss://sso.nexusmods.com';
        const wss = new WebSocket(nexusWSHost, {
            perMessageDeflate: false,
        });

        wss.on('open', function open() {
            if (
                typeof nexusAPIKey === 'undefined' ||
                nexusAPIKey === null ||
                String(nexusAPIKey).length === 0
            ) {
                const requestData = {
                    game_domain_name: requestOptions.gameDomainName,
                    id: requestOptions.fileId,
                    mod_id: requestOptions.modId,
                    key: requestOptions.downloadKey,
                    expires: requestOptions.downloadExpires,
                };

                wss.send(JSON.stringify(requestData));
            }
        });

        wss.on('message', function message(responseJson) {
            console.log(responseJson, 'resp jon?');
        });

        wss.on('error', (err) => {
            console.warn(err);
            dialog.showErrorBox(
                'Nexus Error',
                'App could not establish connection with nexus mods or received unexpected response.',
            );
        });
    });
}
