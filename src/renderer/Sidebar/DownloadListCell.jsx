import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import downloadedFiles from '../../store/downloadedFiles';
import { readableFileSize } from '../../helpers/util';

const DownloadListCell = ({ row, columnKey, selectedKeys, onInstall }) => {
    const downloadedFilesData = toJS(downloadedFiles.files);
    const cellValue = row[columnKey];
    switch (columnKey) {
        case 'name':
            return <p className="truncate max-w-56">{cellValue}</p>;
        case 'date':
            return <p>{new Date(cellValue).formattedDate()}</p>;
        case 'size':
            if (
                typeof row.progress !== 'undefined' &&
                row.progress * 100 !== 100
            ) {
                return (
                    <div>
                        <p>%{Number(row.progress * 100).toFixed(2)}</p>
                    </div>
                );
            }

            return <p>{readableFileSize(row.size || row.total)}</p>;
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
                            <DropdownItem
                                startContent={<EyeIcon className="h-4 w-4" />}
                                onClick={() => {
                                    window.electronAPI.showItemInFolder(
                                        row.path,
                                    );
                                }}
                            >
                                View
                            </DropdownItem>
                            <DropdownItem
                                startContent={<EyeIcon className="h-4 w-4" />}
                                onClick={() => {
                                    onInstall();
                                }}
                            >
                                Install
                            </DropdownItem>
                            <DropdownItem
                                startContent={
                                    <TrashIcon className="h-4 w-4 text-danger" />
                                }
                                onClick={async () => {
                                    let selectedFiles =
                                        Array.from(selectedKeys);

                                    if (selectedFiles.length === 0) {
                                        selectedFiles = [row.name];
                                    }

                                    await window.electronAPI.deleteDownloadFiles(
                                        selectedFiles,
                                    );

                                    const newFilesList =
                                        downloadedFilesData.filter(
                                            function (objFromA) {
                                                return !selectedFiles.find(
                                                    function (objFromB) {
                                                        return (
                                                            objFromA.name ===
                                                            objFromB
                                                        );
                                                    },
                                                );
                                            },
                                        );

                                    runInAction(() => {
                                        downloadedFiles.files = newFilesList;
                                    });
                                }}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            );
        default:
            return cellValue;
    }
};

export default observer(DownloadListCell);
