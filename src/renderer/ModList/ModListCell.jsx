/* eslint-disable no-case-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo } from 'react';
import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Link,
    Image,
    Checkbox,
    Spinner,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { ArrowRightIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import ModListCellIcon from './ModListCellIcon';
import dbKeys from '../../main/db/keys';
import { capitalize } from '../../helpers/util';
import modFiles from '../../store/modFiles';

const ModListCell = ({
    row,
    columnKey,
    onDeleteModalClick,
    onChangePriorityModalClick,
    onShowConflictsModalClick,
    onSelection,
}) => {
    const currentPriority = modFiles.modProfileData.findIndex(
        function (modData) {
            return modData.id === row.id;
        },
    );

    switch (columnKey) {
        case 'selection':
            return useMemo(() => {
                let isChecked = false;

                if (
                    typeof modFiles.modProfileData[currentPriority] !==
                        'undefined' &&
                    typeof modFiles.modProfileData[currentPriority].active !==
                        'undefined' &&
                    modFiles.modProfileData[currentPriority].active === true
                ) {
                    isChecked = true;
                }

                return (
                    <Checkbox
                        color="success"
                        isSelected={isChecked}
                        onValueChange={() => {
                            onSelection();
                        }}
                    >
                        <p></p>
                    </Checkbox>
                );
            }, [currentPriority]);

        case 'order':
            return useMemo(() => {
                return <p className="text-center">{currentPriority}</p>;
            }, [currentPriority]);

        case 'title':
            return useMemo(() => {
                return (
                    <div className="shrink-0 flex gap-2">
                        {row.previewImage ? (
                            <Image
                                src={row.previewImage}
                                width={20}
                                height={20}
                            />
                        ) : (
                            <ModListCellIcon row={row} />
                        )}

                        <p className="truncate">{row.title}</p>
                    </div>
                );
            }, []);

        case 'categories':
            return useMemo(() => {
                return (
                    <div>
                        {typeof row.categories !== 'undefined' &&
                            Array.isArray(row.categories) &&
                            row.categories.map((category) => (
                                <p key={`mod_list_${row.title}_categories`}>
                                    {capitalize(category) === 'Ui'
                                        ? 'UI'
                                        : capitalize(category)}
                                </p>
                            ))}
                    </div>
                );
            }, []);

        case 'conflict':
            return useMemo(() => {
                if (modFiles.conflictsLoading) {
                    return (
                        <div className="flex w-full items-center justify-center">
                            <Spinner size="sm" />
                        </div>
                    );
                }

                if (
                    typeof row.packFileName !== 'undefined' &&
                    row.packFileName !== null &&
                    String(row.packFileName).length > 0 &&
                    typeof modFiles.conflicts !== 'undefined' &&
                    typeof modFiles.conflicts[row.packFileName] !== 'undefined'
                ) {
                    const win = {};
                    const lose = {};
                    for (const packFileName in modFiles.conflicts[
                        row.packFileName
                    ]) {
                        const otherModPacks =
                            modFiles.conflicts[row.packFileName][packFileName];
                        const otherModPacksKeys = otherModPacks;

                        for (
                            let ompi = 0;
                            ompi < otherModPacksKeys.length;
                            ompi++
                        ) {
                            const otherModPack = otherModPacksKeys[ompi];
                            const index = modFiles.files.findIndex((mf) => {
                                return mf.packFileName === otherModPack;
                            });

                            // This pack has been read for conflict but somehow doesnt exists in load order ?
                            // Needs more debugging
                            if (
                                typeof modFiles.files[index] === 'undefined' ||
                                index === null
                            ) {
                                continue;
                            }

                            const conflictedModPriority =
                                modFiles.modProfileData.findIndex(
                                    function (modData) {
                                        return (
                                            modData.id ===
                                            modFiles.files[index].id
                                        );
                                    },
                                );
                            if (currentPriority > conflictedModPriority) {
                                if (typeof win[packFileName] === 'undefined') {
                                    win[packFileName] = [];
                                }
                                win[packFileName].push(
                                    modFiles.files[index].title,
                                );
                            } else {
                                if (typeof lose[packFileName] === 'undefined') {
                                    lose[packFileName] = [];
                                }
                                lose[packFileName].push(
                                    modFiles.files[index].title,
                                );
                            }
                        }
                    }

                    const winKeys = Object.keys(win);
                    const loseKeys = Object.keys(lose);

                    // It is winnig againts upper files but in the end conflcit is won by 3rd party
                    for (let li = 0; li < loseKeys.length; li++) {
                        const loseKey = loseKeys[li];
                        if (winKeys.includes(loseKey)) {
                            winKeys.splice(winKeys.indexOf(loseKey), 1);
                        }
                    }

                    return (
                        <Link
                            className="cursor-pointer hover:text-success"
                            onClick={() => {
                                onShowConflictsModalClick({
                                    isOpen: true,
                                    selectedModRow: row,
                                    win,
                                    winKeys,
                                    lose,
                                    loseKeys,
                                });
                            }}
                        >
                            {winKeys.length > 0 && (
                                <p className="text-success">{winKeys.length}</p>
                            )}
                            {winKeys.length > 0 && loseKeys.length > 0 && (
                                <span className="mx-1 text-white">-</span>
                            )}
                            {loseKeys.length > 0 && (
                                <p className="text-danger">{loseKeys.length}</p>
                            )}
                        </Link>
                    );
                }

                return '';
            }, [modFiles.conflictsLoading, currentPriority]);

        case 'version':
            return useMemo(() => {
                return (
                    <p>
                        {row.steamId !== 'undefined'
                            ? row.updatedAt !== null
                                ? new Date(row.updatedAt).formattedDate()
                                : ''
                            : row.version}
                    </p>
                );
            }, []);

        case 'actions':
            return useMemo(() => {
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
                                                const managedGame =
                                                    await window.electronAPI.dbGet(
                                                        dbKeys.MANAGED_GAME,
                                                    );
                                                window.electronAPI.showItemInFolder(
                                                    `${modInstallationFolder}\\${managedGame}\\${row.title}`,
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
                                        onChangePriorityModalClick({
                                            isOpen: true,
                                            selectedModRow: row,
                                            fromIndex: currentPriority,
                                        });
                                    }}
                                    startContent={
                                        <ArrowRightIcon className="h-4 w-4" />
                                    }
                                >
                                    Set Priority
                                </DropdownItem>

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
            }, [currentPriority]);
        default:
            return row[columnKey];
    }
};

export default observer(ModListCell);
