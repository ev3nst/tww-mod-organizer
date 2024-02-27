import { ipcMain } from 'electron';

import db from '../db';

export default function dbSet() {
    ipcMain.handle('dbSet', (_e, key, value) => {
        return db.set(key, value);
    });
}
