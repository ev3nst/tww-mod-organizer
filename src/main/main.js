/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, globalShortcut } from 'electron';
import { resolveSteamPaths } from './tools/steam';
import ipcHandlers from './ipcHandlers';
import { resolveManagedPaths } from './tools/resolveManagedPaths';
import createWindow from './createWindow';

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
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
    resolveManagedPaths();

    ipcHandlers();
    createWindow();
});
