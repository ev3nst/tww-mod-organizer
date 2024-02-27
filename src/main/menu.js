import { Menu } from 'electron';

export default class MenuBuilder {
    mainWindow;

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }

    buildMenu() {
        if (
            process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_PROD === 'true'
        ) {
            this.setupDevelopmentEnvironment();
        }

        const template =
            process.platform === 'darwin'
                ? this.buildDarwinTemplate()
                : this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment() {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;

            if (
                process.env.NODE_ENV === 'development' ||
                process.env.DEBUG_PROD === 'true'
            ) {
                Menu.buildFromTemplate([
                    {
                        label: 'Inspect element',
                        click: () => {
                            this.mainWindow.webContents.inspectElement(x, y);
                        },
                    },
                ]).popup({ window: this.mainWindow });
            }
        });
    }

    buildDarwinTemplate() {
        return [];
    }

    buildDefaultTemplate() {
        return [];
    }
}
