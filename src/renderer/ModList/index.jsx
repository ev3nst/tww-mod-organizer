import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Link,
    Spinner,
    Image,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { EyeIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import modFiles from '../../store/modFiles';
import steamLogo from '../../../assets/steam-logo.png';
import nexusLogo from '../../../assets/nexus-logo.png';
import dbKeys from '../../main/db/keys';
import { capitalize } from '../../helpers/util';
import DeleteModModal from './DeleteModModal';
import ModOrdering from './ModOrdering';

const columns = [
    { name: '#', uid: 'order', sortable: true },
    { name: 'TITLE', uid: 'title', sortable: true },
    { name: 'CATEGORIES', uid: 'categories', sortable: false },
    { name: 'CONFLICT', uid: 'conflict', sortable: false },
    { name: 'VERSION', uid: 'version', sortable: false },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

function SaveGames() {
    useEffect(() => {
        modFiles.getFiles();
        modFiles.getOrdering();
    }, []);

    const [showDeleteModModal, setShowDeleteModModal] = useState({
        isOpen: false,
        selectedModRow: null,
    });
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'order',
        direction: 'ascending',
    });

    const modFilesData = toJS(modFiles);
    const sortedItems = useMemo(() => {
        return [...modFilesData.files].sort((a, b) => {
            let first = a[sortDescriptor.column];
            let second = b[sortDescriptor.column];
            if (sortDescriptor.column === 'order') {
                first = modFilesData.ordering.indexOf(a.id);
                second = modFilesData.ordering.indexOf(b.id);
            }

            const cmp = first < second ? -1 : first > second ? 0 : 1;
            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [
        modFilesData.files,
        modFilesData.ordering,
        sortDescriptor.column,
        sortDescriptor.direction,
    ]);

    const renderModIcon = (row) => {
        if (typeof row.steamId !== 'undefined') {
            return <Image src={steamLogo} width={20} height={20} />;
        }

        if (typeof row.nexusId !== 'undefined') {
            return <Image src={nexusLogo} width={20} height={20} />;
        }

        return <FolderIcon width={20} height={20} />;
    };

    const renderCell = useCallback(
        (row, columnKey) => {
            switch (columnKey) {
                case 'order':
                    return typeof modFilesData.ordering !== 'undefined' &&
                        modFilesData.ordering.indexOf(row.id) !== -1
                        ? modFilesData.ordering.indexOf(row.id)
                        : '';
                case 'title':
                    return (
                        <div className="flex gap-2">
                            {renderModIcon(row)}

                            <p className="truncate">{row.title}</p>
                        </div>
                    );
                case 'categories':
                    if (
                        typeof row.categories !== 'undefined' &&
                        Array.isArray(row.categories)
                    ) {
                        return (
                            <>
                                {row.categories.map((category) => (
                                    <p key={`mod_list_${row.title}_categories`}>
                                        {capitalize(category)}
                                    </p>
                                ))}
                            </>
                        );
                    }

                    return '';
                case 'version':
                    if (typeof row.steamId !== 'undefined') {
                        return (
                            <p className="truncate">
                                {row.updatedAt !== null
                                    ? new Date(row.updatedAt).formattedDate()
                                    : ''}
                            </p>
                        );
                    }

                    return row.version;

                case 'actions':
                    return (
                        <div className="relative flex justify-end items-center gap-2">
                            <Dropdown className="bg-background border-1 border-default-200">
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        size="sm"
                                        variant="light"
                                    >
                                        <VerticalDotsIcon className="text-default-400" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    {typeof row.modPage !== 'undefined' ? (
                                        <DropdownItem
                                            startContent={
                                                <EyeIcon className="h-4 w-4" />
                                            }
                                        >
                                            <Link
                                                className="text-sm text-dark"
                                                onClick={() => {
                                                    window.electronAPI.openExternalLink(
                                                        row.modPage,
                                                    );
                                                }}
                                            >
                                                Open Mod Page in Browser
                                            </Link>
                                        </DropdownItem>
                                    ) : (
                                        <DropdownItem
                                            startContent={
                                                <EyeIcon className="h-4 w-4" />
                                            }
                                        >
                                            <Link
                                                className="text-sm text-dark"
                                                onClick={async () => {
                                                    const modInstallationFolder =
                                                        await window.electronAPI.dbGet(
                                                            dbKeys.MOD_INSTALLATION_FOLDER,
                                                        );
                                                    window.electronAPI.showItemInFolder(
                                                        `${modInstallationFolder}\\${row.title}`,
                                                    );
                                                }}
                                            >
                                                Open Mod Folder
                                            </Link>
                                        </DropdownItem>
                                    )}

                                    {typeof row.steamId !== 'undefined' && (
                                        <DropdownItem
                                            startContent={
                                                <EyeIcon className="h-4 w-4" />
                                            }
                                        >
                                            <Link
                                                className="text-sm text-dark"
                                                href={`steam://openurl/${row.modPage}`}
                                            >
                                                Open Mod Page in Steam Client
                                            </Link>
                                        </DropdownItem>
                                    )}

                                    <DropdownItem
                                        onClick={() => {
                                            setShowDeleteModModal({
                                                isOpen: true,
                                                selectedModRow: row,
                                            });
                                        }}
                                        startContent={
                                            <TrashIcon className="h-4 w-4 text-danger" />
                                        }
                                    >
                                        {typeof row.steamId !== 'undefined'
                                            ? 'Unsubscribe'
                                            : 'Delete'}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    );
                default:
                    return row[columnKey];
            }
        },
        [modFilesData.ordering],
    );

    const classNames = useMemo(
        () => ({
            wrapper: ['max-h-[382px]', 'max-w-3xl', 'bg-background'],
            th: [
                'bg-transparent',
                'text-default-500',
                'border-b',
                'border-divider',
            ],
            td: [
                // changing the rows border radius
                // first
                'group-data-[first=true]:first:before:rounded-none',
                'group-data-[first=true]:last:before:rounded-none',
                // middle
                'group-data-[middle=true]:before:rounded-none',
                // last
                'group-data-[last=true]:first:before:rounded-none',
                'group-data-[last=true]:last:before:rounded-none',
            ],
        }),
        [],
    );

    return (
        <div className="flex">
            <ModOrdering />
            <Table
                isCompact
                removeWrapper
                checkboxesProps={{
                    classNames: {
                        wrapper:
                            'after:bg-foreground after:text-background text-background',
                    },
                }}
                classNames={classNames}
                topContentPlacement="outside"
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={
                                column.uid === 'actions' ? 'center' : 'start'
                            }
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={
                        modFiles.loading === true ? (
                            <Spinner />
                        ) : (
                            'No mods found'
                        )
                    }
                    items={sortedItems}
                >
                    {(item) => (
                        <TableRow
                            key={item.title}
                            className={
                                modFiles.draggingId === item.id
                                    ? 'bg-slate-800'
                                    : ''
                            }
                        >
                            {(columnKey) => (
                                <TableCell className="subpixel-antialiased text-xs">
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {showDeleteModModal.isOpen && (
                <DeleteModModal
                    selectedModRow={showDeleteModModal.selectedModRow}
                    onModalStateChange={(newState) => {
                        setShowDeleteModModal(newState);
                    }}
                />
            )}
        </div>
    );
}

export default observer(SaveGames);
