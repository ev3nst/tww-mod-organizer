import { useEffect, useState } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import modFiles from '../../store/modFiles';
import DeleteModModal from './DeleteModModal';
import ModProfiles from './ModProfiles';
import ModOrdering from './ModOrdering';
import ModListCell from './ModListCell';
import ModListStyles from './ModListStyles';

const columns = [
    { name: '#', uid: 'order', sortable: false },
    { name: 'TITLE', uid: 'title', sortable: false },
    { name: 'CATEGORIES', uid: 'categories', sortable: false },
    { name: 'CONFLICT', uid: 'conflict', sortable: false },
    { name: 'VERSION', uid: 'version', sortable: false },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

const initialSort = {
    column: 'order',
    direction: 'ascending',
};

async function initData() {
    await modFiles.getFiles();
    await modFiles.getModProfile();
}

function ModList() {
    const modFilesData = toJS(modFiles);

    useEffect(() => {
        initData();
    }, []);

    const selectedKeys = new Set([]);
    if (
        typeof modFilesData.files !== 'undefined' &&
        modFilesData.files !== null &&
        modFilesData.files.length > 0
    ) {
        for (
            let macti = 0;
            macti < modFilesData.modProfileData.length;
            macti++
        ) {
            const modProfData = modFilesData.modProfileData[macti];
            if (modProfData.active === true) {
                const indx = modFilesData.files.findIndex(
                    (fi) => fi.id === modProfData.id,
                );
                if (typeof modFilesData.files[indx] !== 'undefined') {
                    selectedKeys.add(modFilesData.files[indx].title);
                }
            }
        }
    }

    const [showDeleteModModal, setShowDeleteModModal] = useState({
        isOpen: false,
        selectedModRow: null,
    });

    const items = modFilesData.files.slice().sort((a, b) => {
        let first = a[initialSort.column];
        let second = b[initialSort.column];
        if (initialSort.column === 'order') {
            first = modFilesData.modProfileData.findIndex(function (modData) {
                return modData.id === a.id;
            });
            second = modFilesData.modProfileData.findIndex(function (modData) {
                return modData.id === b.id;
            });
        }

        const cmp = first < second ? -1 : first > second ? 0 : 1;
        return initialSort.direction === 'descending' ? -cmp : cmp;
    });

    if (modFilesData.filesLoading || modFilesData.modProfileLoading) {
        return <Spinner />;
    }

    return (
        <>
            <ModProfiles />
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
                    classNames={ModListStyles}
                    topContentPlacement="outside"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={async (keys) => {
                        const selectedArr = Array.from(keys);
                        const selectedModFiles = modFilesData.files.filter(
                            (mf) => selectedArr.includes(mf.title),
                        );
                        const selectedModIds = selectedModFiles.map(
                            (smf) => smf.id,
                        );
                        const updatedModProfileData =
                            await window.electronAPI.setActiveMods(
                                selectedModIds,
                            );
                        runInAction(() => {
                            modFiles.modProfileData = updatedModProfileData;
                        });
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                className={
                                    column.uid === 'categories' ||
                                    column.uid === 'version'
                                        ? 'hidden xl:table-cell'
                                        : ''
                                }
                                key={column.uid}
                                align={
                                    column.uid === 'actions' ||
                                    column.uid === 'order'
                                        ? 'center'
                                        : 'start'
                                }
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody emptyContent="No mods found" items={items}>
                        {(item) => {
                            return (
                                <TableRow
                                    key={item.title}
                                    className={
                                        modFilesData.draggingId === item.id
                                            ? 'bg-slate-800'
                                            : ''
                                    }
                                >
                                    {(columnKey) => (
                                        <TableCell
                                            className={`subpixel-antialiased text-xs ${columnKey === 'categories' || columnKey === 'version' ? 'hidden xl:table-cell' : ''}`}
                                        >
                                            <ModListCell
                                                row={item}
                                                columnKey={columnKey}
                                                onDeleteModalClick={(
                                                    deleteModModalState,
                                                ) => {
                                                    setShowDeleteModModal(
                                                        deleteModModalState,
                                                    );
                                                }}
                                                modProfileData={
                                                    modFilesData.modProfileData
                                                }
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        }}
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
        </>
    );
}

export default observer(ModList);
