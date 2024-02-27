import { ipcMain } from 'electron';

import db from '../db';

export default function dbGet() {
    ipcMain.handle('dbGet', (_e, key) => {
        return db.get(key);
    });
}
