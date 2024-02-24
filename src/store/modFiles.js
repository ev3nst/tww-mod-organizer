import { makeAutoObservable, runInAction, toJS } from 'mobx';
import dbKeys from '../main/db/keys';

class ModFiles {
    files = [];
    modProfile = 'default';
    availableModProfiles = [];
    modProfileData = [];
    tempModProfileData = [];
    draggingId = null;
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async getFiles() {
        runInAction(() => {
            this.loading = true;
        });
        const modFiles = await window.electronAPI.getModsMetaInformation();
        runInAction(() => {
            if (
                typeof modFiles !== 'undefined' &&
                modFiles !== null &&
                typeof modFiles.length !== 'undefined' &&
                modFiles.length > 0
            ) {
                this.files = modFiles;
            }

            this.loading = false;
        });
    }

    async getModProfile() {
        const currentProfile = await window.electronAPI.dbGet(
            dbKeys.MOD_PROFILE,
        );
        const modProfileData = await window.electronAPI.getModProfile(
            currentProfile || this.modProfile,
        );
        const availableModProfiles =
            await window.electronAPI.getAvailableModProfiles();

        runInAction(() => {
            this.modProfileData = modProfileData;
            this.tempModProfileData = modProfileData;
            this.modProfile = currentProfile || 'default';
            this.availableModProfiles = availableModProfiles || [];
            this.loading = false;
        });
    }

    async changeModProfile(profileName) {
        const modProfileData =
            await window.electronAPI.getModProfile(profileName);
        await window.electronAPI.dbSet(dbKeys.MOD_PROFILE, profileName);
        runInAction(() => {
            this.modProfileData = modProfileData;
            this.tempModProfileData = modProfileData;
            this.modProfile = profileName;
        });
    }

    async saveModProfile() {
        await window.electronAPI.saveModProfile(
            toJS(this.modProfile),
            toJS(this.modProfileData),
        );
    }

    async createModProfile(profileName) {
        await window.electronAPI.createModProfile(
            profileName,
            toJS(this.modProfileData),
        );

        let newAvailableModProfiles = toJS(this.availableModProfiles);
        newAvailableModProfiles.push(profileName);
        runInAction(() => {
            this.availableModProfiles = newAvailableModProfiles;
            this.modProfile = profileName;
        });
    }
}

const modFiles = new ModFiles();
export default modFiles;
