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
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Image,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';
import { EyeIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import modFiles from '../../store/modFiles';
import steamLogo from '../../../assets/steam-logo.png';
import nexusLogo from '../../../assets/nexus-logo.png';
import dbKeys from '../../main/db/keys';

const columns = [
    { name: '#', uid: 'order', sortable: true },
    { name: 'TITLE', uid: 'title', sortable: true },
    { name: 'CONFLICT', uid: 'conflict', sortable: false },
    { name: 'VERSION', uid: 'version', sortable: false },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

function SaveGames() {
    useEffect(() => {
        modFiles.getFiles();
    }, []);

    const [deleteModConfirm, setDeleteModConfirm] = useState({
        isOpen: false,
        selectedModRow: null,
    });

    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'date',
        direction: 'descending',
    });

    const modFilesData = toJS(modFiles);
    const sortedItems = useMemo(() => {
        return [...modFilesData.files].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [modFilesData.files, sortDescriptor.column, sortDescriptor.direction]);

    const renderModIcon = (row) => {
        if (typeof row.steamId !== 'undefined') {
            return <Image src={steamLogo} width={20} height={20} />;
        }

        if (typeof row.nexusId !== 'undefined') {
            return <Image src={nexusLogo} width={20} height={20} />;
        }

        return <FolderIcon width={20} height={20} />;
    };

    const renderCell = useCallback((row, columnKey) => {
        const cellValue = row[columnKey];
        switch (columnKey) {
            case 'title':
                return (
                    <div className="flex gap-2">
                        {renderModIcon(row)}

                        <p>{cellValue}</p>
                    </div>
                );
            case 'version':
                if (typeof row.steamId !== 'undefined') {
                    return (
                        <p>
                            {row.updatedAt !== null
                                ? new Date(row.updatedAt).formattedDate()
                                : ''}
                        </p>
                    );
                }

                return cellValue;

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
                                        setDeleteModConfirm({
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
                return cellValue;
        }
    }, []);

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
        <>
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
                selectedKeys={selectedKeys}
                selectionMode="single"
                sortDescriptor={sortDescriptor}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
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
                        <TableRow key={item.title}>
                            {(columnKey) => (
                                <TableCell className="subpixel-antialiased text-xs">
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Modal isOpen={deleteModConfirm.isOpen} hideCloseButton>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Are you sure to unsubscribe/delete selected mod
                                ?
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    If selected mod is from steam workshop then
                                    the mod will be unsubscribed otherwise mod
                                    files will be moved to trash.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    onPress={async () => {
                                        console.log(
                                            deleteModConfirm,
                                            'deleteModConfirm',
                                        );
                                        if (
                                            typeof deleteModConfirm
                                                .selectedModRow.steamId !==
                                            'undefined'
                                        ) {
                                            await window.electronAPI.steamUnsubscribe(
                                                deleteModConfirm.selectedModRow
                                                    .steamId,
                                            );
                                        } else {
                                            await window.electronAPI.deleteMod(
                                                deleteModConfirm.selectedModRow
                                                    .title,
                                            );
                                        }

                                        const newModFiles =
                                            modFiles.files.filter(
                                                (mf) =>
                                                    mf.id !==
                                                    deleteModConfirm
                                                        .selectedModRow.id,
                                            );

                                        runInAction(() => {
                                            modFiles.files = newModFiles;
                                        });

                                        setDeleteModConfirm({
                                            ...deleteModConfirm,
                                            isOpen: false,
                                            selectedModRow: null,
                                        });
                                    }}
                                >
                                    Yes
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        setDeleteModConfirm({
                                            ...deleteModConfirm,
                                            isOpen: false,
                                            selectedModRow: null,
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default observer(SaveGames);
