import { ipcMain } from 'electron';
import db from '../db';
import dbKeys from '../db/keys';

export default function dbSet() {
    ipcMain.handle('dbSet', (_e, key, value) => {
        if (Object.values(dbKeys).includes(key)) {
            return db.set(key, value);
        }
    });
}
