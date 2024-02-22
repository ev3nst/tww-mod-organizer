import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { debounceEffect } from '../helpers/util';

class Settings {
    managedGame = '';
    tww2Path = '';
    tww3Path = '';

    constructor() {
        makeAutoObservable(this);
        this.fetchSavedSettings();

        reaction(
            () => this.managedGame,
            debounceEffect(() => {
                this.saveSettings();
            }, 500),
        );

        reaction(
            () => this.tww2Path,
            debounceEffect(() => {
                this.saveSettings();
            }, 500),
        );

        reaction(
            () => this.tww3Path,
            debounceEffect(() => {
                this.saveSettings();
            }, 500),
        );
    }

    saveSettings() {
        const newSettings = {
            managedGame: this.managedGame || '',
            tww2Path: this.tww2Path.replace(/\//g, '\\/') || '',
            tww3Path: this.tww3Path.replace(/\//g, '\\/') || '',
        };
        window.electronAPI.dbSet('settings', newSettings);
    }

    fetchSavedSettings() {
        const savedSettings = window.electronAPI.dbGet('settings');
        runInAction(() => {
            this.managedGame = savedSettings?.managedGame || '';
            this.tww2Path = savedSettings?.tww2Path || '';
            this.tww3Path = savedSettings?.tww3Path || '';
        });
    }
}

const settings = new Settings();
export default settings;
