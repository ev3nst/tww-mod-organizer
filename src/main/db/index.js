import store from 'electron-store';

const db = new store({
    name: 'default',
});

const packFileStatsDB = new store({
    name: 'pack_file_stats',
});

const packConflictResolverDataDB = new store({
    name: 'pack_conflict_resolver_data',
});

export function clearAllDB() {
    db.clear();
    packFileStatsDB.clear();
    packConflictResolverDataDB.clear();
}

export { db, packFileStatsDB, packConflictResolverDataDB };
