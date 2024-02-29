import { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Spinner,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import DeleteSaveFilesModal from './DeleteSaveFilesModal';
import saveGameFiles from '../../store/saveGameFiles';
import SidebarTableStyles from './SidebarTableStyles';
import DownloadListCell from './DownloadListCell';

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
    const rowsPerPage = 10;
    const pages = Math.ceil(saveGameFiles.files.length / rowsPerPage);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'date',
        direction: 'descending',
    });
    const [page, setPage] = useState(1);
    const [deleteSaveFileModal, setDeleteSaveFileModal] = useState({
        isOpen: false,
        selectedSaveFiles: [],
    });

    const sortedItems = useMemo(() => {
        return [...saveGameFilesData.files].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [
        saveGameFilesData.files,
        sortDescriptor.column,
        sortDescriptor.direction,
    ]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [page, sortedItems]);

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
                <span className="text-default-400 text-small hidden 2xl:flex">
                    Total {saveGameFiles.files.length} files
                </span>
            </div>
        );
    }, [setPage, page, pages]);

    if (saveGameFiles.loading === true) {
        return <Spinner />;
    }

    if (selectedKeys.size === 1) {
        runInAction(() => {
            saveGameFiles.startupSaveGame = Array.from(selectedKeys)[0];
        });
    } else {
        runInAction(() => {
            saveGameFiles.startupSaveGame = null;
        });
    }

    return (
        <>
            <Table
                isCompact
                removeWrapper
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                checkboxesProps={SidebarTableStyles.checkbox}
                classNames={SidebarTableStyles.table}
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
                            className={
                                column.uid === 'size'
                                    ? 'hidden 2xl:table-cell'
                                    : ''
                            }
                            align={
                                column.uid === 'actions' ? 'center' : 'start'
                            }
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent="No files found" items={items}>
                    {(item) => (
                        <TableRow
                            key={item.name}
                            className={
                                selectedKeys.size === 1 &&
                                item.name === Array.from(selectedKeys)[0]
                                    ? 'bg-success'
                                    : ''
                            }
                        >
                            {(columnKey) => (
                                <TableCell
                                    className={`subpixel-antialiased text-xs ${columnKey === 'size' ? 'hidden 2xl:table-cell' : ''}`}
                                >
                                    <DownloadListCell
                                        row={item}
                                        columnKey={columnKey}
                                        onDelete={() => {
                                            let selectedSaveFiles =
                                                Array.from(selectedKeys);

                                            // No selection made
                                            if (
                                                selectedSaveFiles.length === 0
                                            ) {
                                                selectedSaveFiles = [item.name];
                                            }

                                            let resolvedSaveFiles = [];
                                            for (
                                                let ssfi = 0;
                                                ssfi < selectedSaveFiles.length;
                                                ssfi++
                                            ) {
                                                const row =
                                                    selectedSaveFiles[ssfi];
                                                const index =
                                                    saveGameFilesData.files.findIndex(
                                                        (fi) => fi.name === row,
                                                    );
                                                if (index !== -1) {
                                                    resolvedSaveFiles.push(row);
                                                }
                                            }

                                            if (selectedKeys === 'all') {
                                                resolvedSaveFiles =
                                                    saveGameFilesData.files
                                                        .slice(0, rowsPerPage)
                                                        .map((sff) => sff.name);
                                            }

                                            if (resolvedSaveFiles.length > 0) {
                                                setDeleteSaveFileModal({
                                                    isOpen: true,
                                                    selectedSaveFiles:
                                                        resolvedSaveFiles,
                                                });
                                            }
                                        }}
                                    />
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {deleteSaveFileModal.isOpen === true && (
                <DeleteSaveFilesModal
                    selectedSaveFiles={deleteSaveFileModal.selectedSaveFiles}
                    onModalStateChange={(newState) => {
                        setDeleteSaveFileModal(newState);
                    }}
                />
            )}
        </>
    );
}

export default observer(SaveGames);
