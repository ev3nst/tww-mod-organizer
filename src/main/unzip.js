import fs from 'fs';
import path from 'path';
import { sync as mkdripSync } from 'mkdirp';
import { unzipSync } from 'fflate';

async function unzip(zipfile, opts) {
    var {
            to: { directory: odir, fs: ofs },
        } = options(opts),
        z = unzipSync(await open(zipfile));

    for (let [relativePath, content] of Object.entries(z)) {
        var outf = path.join(odir, relativePath);
        mkdripSync(path.dirname(outf), { fs: ofs });
        ofs.writeFileSync(outf, content);
    }
}

async function open(zipfile) {
    if (typeof zipfile === 'string') {
        return fs.readFileSync
            ? fs.readFileSync(zipfile)
            : new Uint8Array(await (await fetch(zipfile)).arrayBuffer());
    } else if (zipfile instanceof ArrayBuffer) {
        return new Uint8Array(zipfile);
    } else return zipfile;
}

function options(opts) {
    if (opts) {
        if (typeof opts === 'string') {
            return { to: { directory: opts, fs } };
        } else if (opts.to) {
            if (typeof opts.to === 'string')
                return { to: { directory: opts.to, fs } };
            else
                return {
                    to: {
                        directory: opts.to.directory || '',
                        fs: opts.to.fs || fs,
                    },
                };
        }
    }
    return { to: { directory: '', fs } };
}

export default unzip;
