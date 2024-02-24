import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';
import dbKeys from '../main/db/keys';

class Settings {
    managedGame;
    gameInstallPaths;

    constructor() {
        makeAutoObservable(this);
        this.fetchSavedSettings();

        reaction(
            () => this.managedGame,
            () => {
                this.saveCurrentSettings();
            },
        );

        reaction(
            () => this.managedGame,
            () => {
                this.saveCurrentSettings();
            },
        );
    }

    async fetchSavedSettings() {
        const dbManagedGame = await window.electronAPI.dbGet(
            dbKeys.MANAGED_GAME,
        );
        const dbGameInstallPaths = await window.electronAPI.dbGet(
            dbKeys.GAME_INSTALL_PATHS,
        );

        runInAction(() => {
            if (typeof dbManagedGame !== 'undefined') {
                this.managedGame = dbManagedGame;
            }

            if (typeof dbGameInstallPaths !== 'undefined') {
                this.gameInstallPaths = dbGameInstallPaths;
            }
        });
    }

    saveCurrentSettings() {
        const currentSettings = toJS(this);
        window.electronAPI.dbSet(
            dbKeys.MANAGED_GAME,
            currentSettings.managedGame,
        );

        window.electronAPI.dbSet(
            dbKeys.GAME_INSTALL_PATHS,
            currentSettings.gameInstallPaths,
        );
    }
}

const settings = new Settings();
export default settings;
