const workerpool = require('workerpool');

function parseConflicts(conflicts) {
    let parsedConflicts = {};
    for (const packConflictName in conflicts) {
        if (typeof parsedConflicts[packConflictName] === 'undefined') {
            parsedConflicts[packConflictName] = {};
        }

        for (const packTwoConflictName in conflicts[packConflictName]) {
            const conflictedFileNames =
                conflicts[packConflictName][packTwoConflictName];
            for (let cf = 0; cf < conflictedFileNames.length; cf++) {
                const conflictedFileName = conflictedFileNames[cf];
                if (
                    typeof parsedConflicts[packConflictName][
                        conflictedFileName
                    ] === 'undefined'
                ) {
                    parsedConflicts[packConflictName][conflictedFileName] = [];
                }

                parsedConflicts[packConflictName][conflictedFileName].push(
                    packTwoConflictName,
                );
            }
        }
    }

    return parsedConflicts;
}

workerpool.worker({
    parseConflicts: parseConflicts,
});
