import sevenBin from '7zip-bin';
import sevenZip from 'node-7z';

const pathTo7zip = sevenBin.path7za;

export const listArchive = (zipPath, fileExts) => {
    return new Promise((resolve, reject) => {
        const files = [];
        const listStream = sevenZip.list(zipPath, {
            $bin: pathTo7zip,
            $cherryPick: fileExts,
        });

        listStream.on('data', (data) => {
            files.push(data.file);
        });

        listStream.on('end', function () {
            return resolve(files);
        });

        listStream.on('error', (err) => reject(err));
    });
};

export const extractFileFromArchive = (zipPath, destination, fileName) => {
    return new Promise((resolve, reject) => {
        const myStream = sevenZip.extract(zipPath, destination, {
            $bin: pathTo7zip,
            $raw: ['-i!' + fileName],
        });

        myStream.on('end', function () {
            resolve(true);
        });

        myStream.on('error', (err) => reject(err));
    });
};
