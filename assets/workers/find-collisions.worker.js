import workerpool from 'workerpool';

function findPackFileCollisions(packsData) {
    const conflicts = {};
    for (let i = 0; i < packsData.length; i++) {
        const pack = packsData[i];
        for (let j = i + 1; j < packsData.length; j++) {
            const packTwo = packsData[j];
            if (pack === packTwo) continue;
            if (pack.name === packTwo.name) continue;
            if (pack.name === 'data.pack' || packTwo.name === 'data.pack')
                continue;

            for (const packFile of pack.packedFiles) {
                if (packFile.name.includes('.rpfm_reserved')) continue;
                for (const packTwoFile of packTwo.packedFiles) {
                    if (packTwoFile.name.includes('.rpfm_reserved')) continue;
                    if (packFile.name === packTwoFile.name) {
                        if (typeof conflicts[pack.name] === 'undefined') {
                            conflicts[pack.name] = {};
                        }

                        if (typeof conflicts[packTwo.name] === 'undefined') {
                            conflicts[packTwo.name] = {};
                        }

                        if (
                            typeof conflicts[pack.name][packFile.name] ===
                            'undefined'
                        ) {
                            conflicts[pack.name][packFile.name] = [];
                        }

                        if (
                            typeof conflicts[packTwo.name][packFile.name] ===
                            'undefined'
                        ) {
                            conflicts[packTwo.name][packFile.name] = [];
                        }

                        conflicts[pack.name][packFile.name].push(packTwo.name);
                        conflicts[packTwo.name][packFile.name].push(pack.name);
                    }
                }
            }
        }
    }

    return conflicts;
}

workerpool.worker({
    findPackFileCollisions: findPackFileCollisions,
});
