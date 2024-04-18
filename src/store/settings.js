import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';
import dbKeys from '../main/db/keys';

class Settings {
    managedGame;
    gameInstallPaths;
    loading = true;

    constructor() {
        makeAutoObservable(this);
        this.fetchSavedSettings();

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

        if (typeof dbManagedGame !== 'undefined' && dbManagedGame !== null) {
            await window.electronAPI.checkPaths();
        }

        const dbGameInstallPaths = await window.electronAPI.dbGet(
            dbKeys.GAME_INSTALL_PATHS,
        );

        if (
            typeof dbGameInstallPaths !== 'undefined' &&
            dbGameInstallPaths !== null
        ) {
            runInAction(() => {
                this.gameInstallPaths = dbGameInstallPaths;
            });
        }

        if (typeof dbManagedGame !== 'undefined' && dbManagedGame !== null) {
            runInAction(() => {
                this.managedGame = dbManagedGame;
            });
        }

        runInAction(() => {
            this.loading = false;
        });
    }

    async saveCurrentSettings() {
        const currentSettings = toJS(this);

        if (typeof currentSettings !== 'undefined') {
            if (
                typeof currentSettings.managedGame !== 'undefined' &&
                currentSettings.managedGame !== null &&
                String(currentSettings.managedGame).length !== 0
            ) {
                await window.electronAPI.dbSet(
                    dbKeys.MANAGED_GAME,
                    currentSettings.managedGame,
                );

                if (
                    typeof currentSettings.gameInstallPaths !== 'undefined' &&
                    currentSettings.gameInstallPaths !== null &&
                    typeof currentSettings.gameInstallPaths[
                        currentSettings.managedGame
                    ] !== 'undefined' &&
                    currentSettings.gameInstallPaths[
                        currentSettings.managedGame
                    ] !== null
                ) {
                    await window.electronAPI.dbSet(
                        dbKeys.GAME_INSTALL_PATHS,
                        currentSettings.gameInstallPaths,
                    );
                }
            }
        }
    }
}

const settings = new Settings();
export default settings;
