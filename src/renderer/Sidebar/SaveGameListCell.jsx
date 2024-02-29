import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
} from '@nextui-org/react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import { readableFileSize } from '../../helpers/util';

const DownloadListCell = ({ row, columnKey, onDelete }) => {
    const cellValue = row[columnKey];
    switch (columnKey) {
        case 'name':
            return <p className="max-w-56">{cellValue}</p>;
        case 'date':
            return <p>{new Date(cellValue).formattedDate()}</p>;
        case 'size':
            return <p>{readableFileSize(cellValue)}</p>;
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
                                startContent={
                                    <TrashIcon className="h-4 w-4 text-danger" />
                                }
                                onClick={() => {
                                    onDelete();
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

export default DownloadListCell;
