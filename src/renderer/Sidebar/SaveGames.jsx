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
    Pagination,
    Spinner,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { VerticalDotsIcon } from '../Icons';
import saveGameFiles from '../../store/saveGameFiles';
import { readableFileSize } from '../../helpers/util';

const columns = [
    { name: 'NAME', uid: 'name', sortable: true },
    { name: 'SIZE', uid: 'size', sortable: true },
    { name: 'DATE', uid: 'date', sortable: true },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

function SaveGames() {
    useEffect(() => {
        saveGameFiles.getFiles();
    }, []);

    const saveGameFilesData = toJS(saveGameFiles);
    const rowsPerPage = 14;
    const pages = Math.ceil(saveGameFiles.files.length / rowsPerPage);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'date',
        direction: 'descending',
    });
    const [page, setPage] = useState(1);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return saveGameFilesData.files.slice(start, end);
    }, [page, saveGameFilesData.files]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = useCallback(
        (row, columnKey) => {
            const cellValue = row[columnKey];
            switch (columnKey) {
                case 'name':
                    return <p className="truncate max-w-56">{cellValue}</p>;
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
                                        startContent={
                                            <EyeIcon className="h-4 w-4" />
                                        }
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
                                            let selectedFiles =
                                                Array.from(selectedKeys);

                                            if (selectedFiles.length === 0) {
                                                selectedFiles = [row.name];
                                            }

                                            window.electronAPI.deleteSaveFiles(
                                                selectedFiles,
                                            );

                                            const newFilesList =
                                                saveGameFilesData.files.filter(
                                                    function (objFromA) {
                                                        return !selectedFiles.find(
                                                            function (
                                                                objFromB,
                                                            ) {
                                                                return (
                                                                    objFromA.name ===
                                                                    objFromB
                                                                );
                                                            },
                                                        );
                                                    },
                                                );

                                            runInAction(() => {
                                                saveGameFiles.files =
                                                    newFilesList;
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
        },
        [saveGameFilesData.files, selectedKeys],
    );

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    showControls
                    classNames={{
                        cursor: 'bg-foreground text-background',
                        wrapper: 'gap-2',
                    }}
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <span className="text-default-400 text-small">
                    Total {saveGameFiles.files.length} files
                </span>
            </div>
        );
    }, [setPage, page, pages]);

    const classNames = useMemo(
        () => ({
            base: ['h-full'],
            wrapper: [
                'bg-transparent',
                'border-0',
                'shadow-none',
                'p-0',
                'h-full',
            ],
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

    if (saveGameFiles.loading === true) {
        return <Spinner />;
    }

    return (
        <Table
            isCompact
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            checkboxesProps={{
                classNames: {
                    wrapper:
                        'after:bg-foreground after:text-background text-background',
                },
            }}
            classNames={classNames}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.uid === 'actions' ? 'center' : 'start'}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent="No files found" items={sortedItems}>
                {(item) => (
                    <TableRow key={item.name}>
                        {(columnKey) => (
                            <TableCell className="subpixel-antialiased text-xs">
                                {renderCell(item, columnKey)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

export default observer(SaveGames);
