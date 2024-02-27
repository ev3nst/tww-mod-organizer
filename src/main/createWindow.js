import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import MenuBuilder from './menu';

const createWindow = () => {
    let mainWindow = null;
    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths) => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1280,
        height: 800,
        minWidth: 1280,
        minHeight: 800,
        autoHideMenuBar: true,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegrationInWorker: true,
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    let htmlPath;
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212;
        const url = new URL(`http://localhost:${port}`);
        url.pathname = 'index.html';
        htmlPath = url.href;
    } else {
        htmlPath = `file://${path.resolve(__dirname, '../renderer/', 'index.html')}`;
    }

    mainWindow.removeMenu();
    mainWindow.loadURL(htmlPath);
    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }

        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    return mainWindow;
};

export default createWindow;
