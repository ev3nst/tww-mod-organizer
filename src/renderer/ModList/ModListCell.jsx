import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Link,
} from '@nextui-org/react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import ModListCellIcon from './ModListCellIcon';
import dbKeys from '../../main/db/keys';
import { capitalize } from '../../helpers/util';

const ModListCell = ({
    row,
    columnKey,
    onDeleteModalClick,
    modProfileData,
}) => {
    switch (columnKey) {
        case 'order':
            if (typeof modProfileData !== 'undefined') {
                const modIndex = modProfileData.findIndex(function (modData) {
                    return modData.id === row.id;
                });
                return <p className="text-center">{modIndex}</p>;
            }

            return '';
        case 'title':
            return (
                <div className="shrink-0 flex gap-2">
                    <ModListCellIcon row={row} />
                    <p>{row.title}</p>
                </div>
            );
        case 'categories':
            if (
                typeof row.categories !== 'undefined' &&
                Array.isArray(row.categories)
            ) {
                return (
                    <div>
                        {row.categories.map((category) => (
                            <p key={`mod_list_${row.title}_categories`}>
                                {capitalize(category)}
                            </p>
                        ))}
                    </div>
                );
            }

            return '';
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
                                    onDeleteModalClick({
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
};

export default ModListCell;