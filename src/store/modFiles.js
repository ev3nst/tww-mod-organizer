import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';

class ModFiles {
    files = [];
    ordering = [];
    tempOrdering = [];
    draggingId = null;
    loading = false;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.ordering,
            () => {
                this.saveOrdering();
            },
        );
    }

    async getFiles() {
        runInAction(() => {
            this.loading = true;
        });
        const modFiles = await window.electronAPI.getModFiles();
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

    async getOrdering() {
        const ordering = await window.electronAPI.getModOrder();

        runInAction(() => {
            this.ordering = ordering;
            this.tempOrdering = ordering;
            this.loading = false;
        });
    }

    async saveOrdering() {
        await window.electronAPI.saveModOrder(toJS(this.ordering));
    }
}

const modFiles = new ModFiles();
export default modFiles;
