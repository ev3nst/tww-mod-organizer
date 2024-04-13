import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
} from '@nextui-org/react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import modFiles from '../../store/modFiles';

import ModListCell from './ModListCell';
import ModListStyles from './ModListStyles';

const initialSort = {
    column: 'order',
    direction: 'ascending',
};

const columns = [
    { name: '#', uid: 'order', sortable: false },
    { name: 'SELECTION', uid: 'selection', sortable: false },
    { name: 'TITLE', uid: 'title', sortable: false },
    { name: 'CATEGORIES', uid: 'categories', sortable: false },
    { name: 'CONFLICT', uid: 'conflict', sortable: false },
    { name: 'VERSION', uid: 'version', sortable: false },
    { name: 'ACTIONS', uid: 'actions', sortable: false },
];

const ModTable = ({
    setShowDeleteModModal,
    setShowChangePriorityModModal,
    setShowConflictsModalClick,
}) => {
    let items = modFiles.files.slice();
    if (modFiles.searchFilter.length > 0) {
        items = items.filter((mf) =>
            mf.title
                .toLowerCase()
                .includes(modFiles.searchFilter.toLowerCase()),
        );
    }

    if (typeof modFiles.modProfileData.findIndex !== 'undefined') {
        items = items.sort((a, b) => {
            let first = a[initialSort.column];
            let second = b[initialSort.column];
            if (initialSort.column === 'order') {
                first = modFiles.modProfileData.findIndex(function (modData) {
                    return modData.id === a.id;
                });
                second = modFiles.modProfileData.findIndex(function (modData) {
                    return modData.id === b.id;
                });
            }

            const cmp = first < second ? -1 : first > second ? 0 : 1;
            return initialSort.direction === 'descending' ? -cmp : cmp;
        });
    }

    return (
        <Table
            isCompact
            removeWrapper
            classNames={ModListStyles.table}
            topContentPlacement="outside"
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        className={
                            column.uid === 'categories' ||
                            column.uid === 'version'
                                ? 'hidden 2xl:table-cell'
                                : ''
                        }
                        key={column.uid}
                        align={
                            column.uid === 'actions' || column.uid === 'order'
                                ? 'center'
                                : 'start'
                        }
                    >
                        {column.uid === 'selection' ? (
                            <Checkbox
                                color="success"
                                isSelected={false}
                                onClick={async () => {
                                    let selectedModIds = [];
                                    if (
                                        typeof modFiles.modProfileData !==
                                            'undefined' &&
                                        typeof modFiles.modProfileData[0] !==
                                            'undefined'
                                    ) {
                                        if (
                                            modFiles.modProfileData[0]
                                                .active === false
                                        ) {
                                            selectedModIds = modFiles.files.map(
                                                (mf) => mf.id,
                                            );
                                        }

                                        const updatedModProfileData =
                                            await window.electronAPI.setActiveMods(
                                                selectedModIds,
                                            );
                                        runInAction(() => {
                                            modFiles.modProfileData =
                                                updatedModProfileData;
                                            modFiles.tempModProfileData =
                                                updatedModProfileData;
                                        });
                                    }
                                }}
                            />
                        ) : (
                            column.name
                        )}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent="No mods found" items={items}>
                {(item) => {
                    return (
                        <TableRow
                            key={item.title}
                            className={
                                modFiles.draggingId == item.id
                                    ? 'bg-slate-800'
                                    : ''
                            }
                        >
                            {(columnKey) => (
                                <TableCell
                                    className={`subpixel-antialiased text-xs ${columnKey === 'categories' || columnKey === 'version' ? 'hidden 2xl:table-cell' : ''}`}
                                >
                                    <ModListCell
                                        row={item}
                                        columnKey={columnKey}
                                        onSelection={async () => {
                                            const selectedArr =
                                                modFiles.modProfileData
                                                    .filter(
                                                        (mfdf) => mfdf.active,
                                                    )
                                                    .map((mfd) => mfd.id);

                                            if (selectedArr.includes(item.id)) {
                                                selectedArr.splice(
                                                    selectedArr.indexOf(
                                                        item.id,
                                                    ),
                                                    1,
                                                );
                                            } else {
                                                selectedArr.push(item.id);
                                            }

                                            let selectedModIds = [];
                                            const selectedModFiles =
                                                modFiles.files.filter((mf) =>
                                                    selectedArr.includes(mf.id),
                                                );
                                            selectedModIds =
                                                selectedModFiles.map(
                                                    (smf) => smf.id,
                                                );

                                            const updatedModProfileData =
                                                await window.electronAPI.setActiveMods(
                                                    selectedModIds,
                                                );
                                            runInAction(() => {
                                                modFiles.modProfileData =
                                                    updatedModProfileData;
                                                modFiles.tempModProfileData =
                                                    updatedModProfileData;
                                            });
                                        }}
                                        onDeleteModalClick={(
                                            deleteModModalState,
                                        ) => {
                                            setShowDeleteModModal(
                                                deleteModModalState,
                                            );
                                        }}
                                        onChangePriorityModalClick={(
                                            changePriorityModModalState,
                                        ) => {
                                            setShowChangePriorityModModal(
                                                changePriorityModModalState,
                                            );
                                        }}
                                        onShowConflictsModalClick={(
                                            changeConflictModalState,
                                        ) => {
                                            setShowConflictsModalClick(
                                                changeConflictModalState,
                                            );
                                        }}
                                    />
                                </TableCell>
                            )}
                        </TableRow>
                    );
                }}
            </TableBody>
        </Table>
    );
};

export default observer(ModTable);
