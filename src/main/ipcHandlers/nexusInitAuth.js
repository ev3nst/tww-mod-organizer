import { dialog, ipcMain, shell } from 'electron';
import { ulid } from 'ulid';

import WebSocket from 'ws';
import db from '../db';
import dbKeys from '../db/keys';

export default function nexusInitAuth() {
    ipcMain.handle('nexusInitAuth', async () => {
        const nexusWSHost = 'wss://sso.nexusmods.com';
        const wss = new WebSocket(nexusWSHost, {
            perMessageDeflate: false,
        });

        wss.on('open', function open() {
            const nexusAPIKey = db.get(dbKeys.NEXUS_API_KEY);
            if (
                typeof nexusAPIKey === 'undefined' ||
                nexusAPIKey === null ||
                String(nexusAPIKey).length === 0
            ) {
                const requestData = {
                    id: ulid(),
                    token: null,
                    protocol: 2,
                };

                db.set(dbKeys.NEXUS_AUTH_PARAMS, {
                    id: requestData.id,
                    token: null,
                });

                wss.send(JSON.stringify(requestData));
            }
        });

        wss.on('message', function message(responseJson) {
            try {
                const response = JSON.parse(responseJson.toString());
                if (
                    typeof response !== 'undefined' &&
                    typeof response.data !== 'undefined' &&
                    typeof response.data.connection_token !== 'undefined'
                ) {
                    const nexusAuthParams = db.get(dbKeys.NEXUS_AUTH_PARAMS);
                    const newNexusAuthParams = {
                        ...nexusAuthParams,
                        token: response.data.connection_token,
                    };
                    db.set(dbKeys.NEXUS_AUTH_PARAMS, newNexusAuthParams);
                    const tokenAuthRequestUrl = `https://www.nexusmods.com/sso?id=${newNexusAuthParams.id}&application=tww`;
                    shell.openExternal(tokenAuthRequestUrl);
                }

                if (
                    typeof response !== 'undefined' &&
                    typeof response.data !== 'undefined' &&
                    typeof response.data.api_key !== 'undefined'
                ) {
                    db.set(dbKeys.NEXUS_API_KEY, response.data.api_key);
                    wss.close();
                }
            } catch (e) {
                dialog.showErrorBox(
                    'Nexus Auth Error',
                    'App could not establish connection with nexus mods or received unexpected response.',
                );
            }
        });

        wss.on('error', (err) => {
            console.warn(err);
            dialog.showErrorBox(
                'Nexus Auth Error',
                'App could not establish connection with nexus mods or received unexpected response.',
            );
        });
    });
}
