/* eslint-disable no-unused-vars */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, globalShortcut, dialog } from 'electron';
import path from 'path';
import ipcHandlers from './ipcHandlers';
import createWindow from './createWindow';
import { resolveSaveGamePaths, resolveSteamPaths } from './tools/steam';
import { resolveManagedPaths } from './tools/resolveManagedPaths';

let mainWindow = null;
if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('nxm', process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    }
} else {
    app.setAsDefaultProtocolClient('nxm');
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

        const nxmLink = commandLine.pop();
        mainWindow.webContents.send('nxm-link-received', nxmLink);
    });

    app.on('ready', function () {
        globalShortcut.register('tab', () => {
            return false;
        });

        if (!isDebug) {
            // Disable reload
            globalShortcut.register('f5', () => {
                return false;
            });
            globalShortcut.register('ctrl+r', () => {
                return false;
            });
        }

        // Steam related
        resolveSteamPaths();
        resolveSaveGamePaths();
        resolveManagedPaths();

        ipcHandlers();
        mainWindow = createWindow();
    });
}

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
