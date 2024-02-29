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
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import downloadedFiles from '../../store/downloadedFiles';
import DownloadListCell from './DownloadListCell';
import SidebarTableStyles from './SidebarTableStyles';
import InstallModModal from '../Components/InstallModModal';
import InstallModalState from '../Components/InstallModalState';

const columns = [
    { name: 'NAME', uid: 'name', sortable: true },
    { name: 'SIZE', uid: 'size', sortable: true },
    { name: 'DATE', uid: 'date', sortable: true },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

function Downloads() {
    useEffect(() => {
        downloadedFiles.getFiles();
    }, []);

    const [installModConfirm, setInstallModConfirm] =
        useState(InstallModalState);

    const downloadedFilesData = toJS(downloadedFiles.files);
    const rowsPerPage = 10;
    const pages = Math.ceil(downloadedFilesData.length / rowsPerPage);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'date',
        direction: 'descending',
    });
    const [page, setPage] = useState(1);

    const sortedItems = useMemo(() => {
        return [...downloadedFilesData].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [sortDescriptor, downloadedFilesData]);

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
                <span className="text-default-400 text-small 2xl:flex">
                    Total {downloadedFiles.files.length} files
                </span>
            </div>
        );
    }, [setPage, page, pages]);

    if (downloadedFiles.loading === true) {
        return <Spinner />;
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
                                column.uid === 'date'
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
                        <TableRow key={item.name}>
                            {(columnKey) => (
                                <TableCell className="subpixel-antialiased text-xs">
                                    <DownloadListCell
                                        row={item}
                                        columnKey={columnKey}
                                        selectedKeys={selectedKeys}
                                        onInstall={() => {
                                            const pathExp =
                                                item.path.split('\\');
                                            let defaultNameFromPath =
                                                pathExp[pathExp.length - 1];

                                            const defaultModName =
                                                defaultNameFromPath
                                                    .substring(
                                                        0,
                                                        defaultNameFromPath.lastIndexOf(
                                                            '.',
                                                        ),
                                                    )
                                                    .replace(/^.*[\\/]/, '');

                                            setInstallModConfirm({
                                                isModalOpen: true,
                                                zipPath: item.path,
                                                defaultModName,
                                            });
                                        }}
                                    />
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <InstallModModal
                key="downloads_InstallModModal"
                confirmOpts={installModConfirm}
                onModConfirm={(state) => {
                    setInstallModConfirm(state);
                }}
            />
        </>
    );
}

export default observer(Downloads);
