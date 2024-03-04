const workerpool = require('workerpool');

function findPackFileCollisions(pack, packTwo) {
    const conflicts = {};
    for (const packFileName of pack.packedFiles) {
        if (packFileName.indexOf('.rpfm_reserved') !== -1) continue;
        for (const packTwoFileName of packTwo.packedFiles) {
            if (packTwoFileName.indexOf('.rpfm_reserved') !== -1) continue;
            if (packFileName === packTwoFileName) {
                if (typeof conflicts[pack.name] === 'undefined') {
                    conflicts[pack.name] = {};
                }

                if (typeof conflicts[packTwo.name] === 'undefined') {
                    conflicts[packTwo.name] = {};
                }

                if (typeof conflicts[pack.name][packTwo.name] === 'undefined') {
                    conflicts[pack.name][packTwo.name] = [];
                }

                if (typeof conflicts[packTwo.name][pack.name] === 'undefined') {
                    conflicts[packTwo.name][pack.name] = [];
                }

                conflicts[pack.name][packTwo.name].push(packFileName);
                conflicts[packTwo.name][pack.name].push(packFileName);
            }
        }
    }

    return conflicts;
}

workerpool.worker({
    findPackFileCollisions: findPackFileCollisions,
});
