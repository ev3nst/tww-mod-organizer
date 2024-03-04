const BinaryFile = require('binary-file');
const workerpool = require('workerpool');
const wh3Schema = require('./schema_wh3.json');
const wh2Schema = require('./schema_wh2.json');

const DBNameToDBVersions = {
    wh2: {},
    wh3: {},
    threeKingdoms: {},
};

const wh3Definitions = wh3Schema.definitions;
for (const table_name in wh3Definitions) {
    DBNameToDBVersions['wh3'][table_name] = wh3Definitions[table_name];
}

const wh2Definitions = wh2Schema.definitions;
for (const table_name in wh2Definitions) {
    DBNameToDBVersions['wh2'][table_name] = wh2Definitions[table_name];
}

const locFields = [
    {
        name: 'key',
        field_type: 'StringU16',
        default_value: '',
        is_key: true,
        is_filename: false,
        is_reference: [],
        description: '',
        ca_order: 0,
        is_bitwise: 0,
        enum_values: {},
    },
    {
        name: 'text',
        field_type: 'StringU16',
        default_value: '',
        is_key: true,
        is_filename: false,
        is_reference: [],
        description: '',
        ca_order: 0,
        is_bitwise: 0,
        enum_values: {},
    },
    {
        name: 'tooltip',
        field_type: 'Boolean',
        default_value: 'false',
        is_key: true,
        is_filename: false,
        is_reference: [],
        description: '',
        ca_order: 0,
        is_bitwise: 0,
        enum_values: {},
    },
];

function parseTypeBuffer(buffer, pos, type, existingFields) {
    const fields = existingFields || [];
    switch (type) {
        case 'Boolean': {
            const val = buffer.readUInt8(pos);
            pos += 1;
            fields.push({ type: 'UInt8', val });
            return [fields, pos];
        }
        case 'ColourRGB': {
            const val = buffer.readInt32LE(pos);
            pos += 4;
            fields.push({ type: 'I32', val });
            return [fields, pos];
        }
        case 'StringU16': {
            try {
                const length = buffer.readInt16LE(pos);
                pos += 2;
                const val = buffer
                    .subarray(pos, pos + length * 2)
                    .toString('utf16le');
                pos += length * 2;
                fields.push({ type: 'String', val });
                return [fields, pos];
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
        case 'StringU8': {
            const length = buffer.readUint16LE(pos);
            pos += 2;
            const val = buffer.subarray(pos, pos + length).toString('ascii');
            pos += length;

            fields.push({ type: 'Int16', val: length });
            fields.push({ type: 'String', val });
            return [fields, pos];
        }
        case 'OptionalStringU8': {
            const doesExist = buffer.readUint8(pos);
            pos += 1;
            fields.push({ type: 'Int8', val: doesExist });
            if (doesExist === 1) {
                return parseTypeBuffer(buffer, pos, 'StringU8', fields);
            }

            return [fields, pos];
        }
        case 'F32': {
            const doesExist = buffer.readFloatLE(pos);
            pos += 4;
            fields.push({ type: 'F32', val: doesExist });
            return [fields, pos];
        }
        case 'I32': {
            const doesExist = buffer.readInt32LE(pos);
            pos += 4;
            fields.push({ type: 'I32', val: doesExist });
            return [fields, pos];
        }
        case 'F64': {
            const doesExist = buffer.readDoubleLE(pos);
            pos += 8;
            fields.push({ type: 'F64', val: doesExist });
            return [fields, pos];
        }
        case 'I64': {
            const doesExist = Number(buffer.readBigInt64LE(pos));
            pos += 8;
            fields.push({ type: 'I64', val: doesExist });
            return [fields, pos];
        }
        default:
            throw new Error('NO WAY TO RESOLVE ' + type);
    }
}

const readUTFStringFromBuffer = (buffer, pos) => {
    const length = buffer.readInt16LE(pos);
    pos += 2;
    return [
        buffer.subarray(pos, pos + length * 2).toString('utf8'),
        pos + length * 2,
    ];
};

const readDBPackedFiles = async (
    packReadingOptions,
    dbPackFiles,
    buffer,
    startPos,
    modPath,
    currentGameSchema,
) => {
    let currentPos = 0;
    for (const pack_file of dbPackFiles) {
        if (
            packReadingOptions.tablesToRead &&
            !packReadingOptions.tablesToRead.some((tableToRead) =>
                pack_file.name.startsWith(tableToRead),
            )
        )
            continue;

        if (packReadingOptions.tablesToRead) {
            console.log('READING TABLE ', pack_file.name);
        }

        currentPos = pack_file.start_pos - startPos;

        const dbNameMatch = pack_file.name.match(/^db\\(.*?)\\/);
        if (dbNameMatch == null) continue;
        const dbName = dbNameMatch[1];
        if (dbName == null) continue;

        const dbversions = DBNameToDBVersions[currentGameSchema][dbName];
        if (!dbversions) continue;

        let version;
        for (;;) {
            const marker = await buffer.subarray(currentPos, currentPos + 4);
            currentPos += 4;

            if (marker.toString('hex') === 'fdfefcff') {
                const readUTF = readUTFStringFromBuffer(buffer, currentPos);
                currentPos = readUTF[1];
            } else if (marker.toString('hex') === 'fcfdfeff') {
                version = buffer.readInt32LE(currentPos);
                currentPos += 4;

                pack_file.version = version;
            } else {
                currentPos -= 4;
                currentPos += 1;
                break;
            }
        }

        const dbversion =
            dbversions.find((dbversion) => dbversion.version == version) ||
            dbversions.find((dbversion) => dbversion.version == 0);
        if (!dbversion) continue;
        if (version != null && dbversion.version < version) continue;

        const entryCount = buffer.readInt32LE(currentPos);
        currentPos += 4;

        try {
            for (let i = 0; i < entryCount; i++) {
                for (const field of dbversion.fields) {
                    const { field_type } = field;

                    const fieldsRet = await parseTypeBuffer(
                        buffer,
                        currentPos,
                        field_type,
                    );
                    currentPos = fieldsRet[1];
                }
            }
        } catch {
            console.log(
                `cannot read ${pack_file.name} in ${modPath}, skipping it`,
            );
        }
    }
};

const readLoc = async (
    packReadingOptions,
    locPackFile,
    buffer,
    startPos,
    modPath,
) => {
    let currentPos = 0;
    const marker = await buffer.subarray(currentPos, currentPos + 2);
    currentPos += 2;

    if (marker.toString('hex') != 'fffe') {
        console.log('FF FE marker is wrong!');
        return;
    }

    const locMarker = await buffer.subarray(currentPos, currentPos + 3);
    currentPos += 3;
    if (locMarker.toString('hex') != '4c4f43') {
        console.log('LOC marker is wrong!');
        return;
    }

    currentPos += 1;
    currentPos += 4;

    const entryCount = buffer.readInt32LE(currentPos);
    currentPos += 4;

    try {
        for (let i = 0; i < entryCount; i++) {
            for (const field of locFields) {
                const { field_type, is_key } = field;
                const fieldsRet = await parseTypeBuffer(
                    buffer,
                    currentPos,
                    field_type,
                );
                const fields = fieldsRet[0];
                currentPos = fieldsRet[1];

                const schemaField = {
                    // name,
                    type: field_type,
                    fields,
                };
                if (is_key) {
                    schemaField.isKey = true;
                }
                locPackFile.schemaFields = locPackFile.schemaFields || [];
                locPackFile.schemaFields.push(schemaField);
            }
        }
    } catch {
        console.log(
            `cannot read ${locPackFile.name} in ${modPath}, skipping it`,
        );
    }
};

const readPack = async (
    modPath,
    baseModPath,
    packReadingOptions = { skipParsingTables: false },
    currentGameSchema,
) => {
    const pack_files = [];
    let packHeader;
    const dependencyPacks = [];

    const file = new BinaryFile(modPath, 'r', true);
    try {
        await file.open();
        const header = await file.read(4);
        if (header === null) throw new Error('header missing');

        const byteMask = await file.readInt32();
        const refFileCount = await file.readInt32();
        const pack_file_index_size = await file.readInt32();
        const pack_file_count = await file.readInt32();
        const packed_file_index_size = await file.readInt32();

        const header_buffer_len = 4;
        const header_buffer = await file.read(4); // header_buffer

        packHeader = {
            header,
            byteMask,
            refFileCount,
            pack_file_index_size,
            pack_file_count,
            header_buffer,
        };

        if (pack_file_index_size > 0) {
            let chunk;
            let bufPos = 0;
            let lastDependencyStart = 0;
            const packIndexBuffer = await file.read(pack_file_index_size);

            while (null !== (chunk = packIndexBuffer.readInt8(bufPos))) {
                bufPos += 1;
                if (chunk == 0) {
                    const name = packIndexBuffer.toString(
                        'utf8',
                        lastDependencyStart,
                        bufPos - 1,
                    );
                    dependencyPacks.push(name);
                    lastDependencyStart = bufPos;
                    if (bufPos >= pack_file_index_size) {
                        break;
                    }
                }
            }
        }

        const dataStart =
            24 +
            header_buffer_len +
            pack_file_index_size +
            packed_file_index_size;

        let chunk;
        let file_pos = dataStart;

        const headerSize = dataStart - file.tell();
        const headerBuffer = await file.read(headerSize);
        let bufPos = 0;
        for (let i = 0; i < pack_file_count; i++) {
            let name = '';

            const file_size = headerBuffer.readInt32LE(bufPos);
            bufPos += 4;
            // eslint-disable-next-line no-unused-vars
            const is_compressed = headerBuffer.readInt8(bufPos);
            bufPos += 1;

            const nameStartPos = bufPos;
            while (null !== (chunk = headerBuffer.readInt8(bufPos))) {
                bufPos += 1;
                if (chunk == 0) {
                    name = headerBuffer.toString(
                        'utf8',
                        nameStartPos,
                        bufPos - 1,
                    );
                    break;
                }
            }

            pack_files.push({
                name,
                file_size,
                start_pos: file_pos,
                // is_compressed,
            });
            file_pos += file_size;
        }

        const dbPackFiles = pack_files.filter((packFile) => {
            const dbNameMatch = packFile.name.match(/^db\\(.*?)\\/);
            return dbNameMatch != null && dbNameMatch[1];
        });

        if (packReadingOptions.skipParsingTables || dbPackFiles.length < 1) {
            return {
                name: baseModPath,
                path: modPath,
                packedFiles: pack_files.map((pf) => pf.name),
                packHeader,
                readTables: [],
                dependencyPacks,
            };
        }

        const startPos = dbPackFiles.reduce(
            (previous, current) =>
                previous < current.start_pos ? previous : current.start_pos,
            Number.MAX_SAFE_INTEGER,
        );

        const startOfLastPack = dbPackFiles.reduce(
            (previous, current) =>
                previous > current.start_pos ? previous : current.start_pos,
            -1,
        );
        const endPos =
            (dbPackFiles.find(
                (packFile) => packFile.start_pos === startOfLastPack,
            )?.file_size ?? 0) + startOfLastPack;

        const buffer = await file.read(endPos - startPos, startPos);

        await readDBPackedFiles(
            packReadingOptions,
            dbPackFiles,
            buffer,
            startPos,
            modPath,
            currentGameSchema,
        );

        if (packReadingOptions.readLocs) {
            const locPackFiles = pack_files.filter((packFile) => {
                const locNameMatch = packFile.name.match(/\.loc$/);
                return locNameMatch != null;
            });

            for (const locPackFile of locPackFiles) {
                const buffer = await file.read(
                    locPackFile.file_size,
                    locPackFile.start_pos,
                );
                await readLoc(
                    packReadingOptions,
                    locPackFile,
                    buffer,
                    startPos,
                    modPath,
                );
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
        if (file) await file.close();
    }

    return {
        name: baseModPath,
        path: modPath,
        packedFiles: pack_files.map((pf) => pf.name),
        dependencyPacks,
    };
};

workerpool.worker({
    readPack: readPack,
});
