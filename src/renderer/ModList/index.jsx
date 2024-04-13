import { useEffect, useState } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Checkbox,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import modFiles from '../../store/modFiles';
import DeleteModModal from './DeleteModModal';
import ChangePriorityModal from './ChangePriorityModal';
import ShowConflictsModal from './ShowConflictsModal';
import ModProfiles from './ModProfiles';
import ModOrdering from './ModOrdering';
import ModListCell from './ModListCell';
import ModListStyles from './ModListStyles';

const columns = [
    { name: '#', uid: 'order', sortable: false },
    { name: 'SELECTION', uid: 'selection', sortable: false },
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

    const [showChangePriorityModModalState, setShowChangePriorityModModal] =
        useState({
            isOpen: false,
            selectedModRow: null,
            fromIndex: null,
        });

    const [changeConflictModalState, setShowConflictsModalClick] = useState({
        isOpen: false,
        selectedModRow: null,
        win: {},
        winKeys: [],
        lose: {},
        loseKeys: [],
    });

    let items = modFilesData.files.slice();
    if (modFilesData.searchFilter.length > 0) {
        items = items.filter((mf) =>
            mf.title
                .toLowerCase()
                .includes(modFilesData.searchFilter.toLowerCase()),
        );
    }

    if (typeof modFilesData.modProfileData.findIndex !== 'undefined') {
        items = items.sort((a, b) => {
            let first = a[initialSort.column];
            let second = b[initialSort.column];
            if (initialSort.column === 'order') {
                first = modFilesData.modProfileData.findIndex(
                    function (modData) {
                        return modData.id === a.id;
                    },
                );
                second = modFilesData.modProfileData.findIndex(
                    function (modData) {
                        return modData.id === b.id;
                    },
                );
            }

            const cmp = first < second ? -1 : first > second ? 0 : 1;
            return initialSort.direction === 'descending' ? -cmp : cmp;
        });
    }

    if (modFilesData.filesLoading || modFilesData.modProfileLoading) {
        return <Spinner />;
    }

    return (
        <>
            {modFilesData.conflicts.length > 0 && <div className="hidden" />}
            {modFilesData.searchFilter.length === 0 && <ModProfiles />}
            <div className="flex">
                {modFilesData.searchFilter.length === 0 && <ModOrdering />}
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
                                    column.uid === 'actions' ||
                                    column.uid === 'order'
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
                                                typeof modFiles
                                                    .modProfileData[0] !==
                                                    'undefined'
                                            ) {
                                                if (
                                                    modFiles.modProfileData[0]
                                                        .active === false
                                                ) {
                                                    selectedModIds =
                                                        modFilesData.files.map(
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
                            const currentPriority =
                                modFilesData.modProfileData.findIndex(
                                    function (modData) {
                                        return modData.id === item.id;
                                    },
                                );
                            let isChecked = false;

                            if (
                                typeof modFilesData.modProfileData[
                                    currentPriority
                                ] !== 'undefined' &&
                                typeof modFilesData.modProfileData[
                                    currentPriority
                                ].active !== 'undefined' &&
                                modFilesData.modProfileData[currentPriority]
                                    .active === true
                            ) {
                                isChecked = true;
                            }

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
                                            className={`subpixel-antialiased text-xs ${columnKey === 'categories' || columnKey === 'version' ? 'hidden 2xl:table-cell' : ''}`}
                                        >
                                            <ModListCell
                                                row={item}
                                                columnKey={columnKey}
                                                modFilesData={modFilesData}
                                                currentPriority={
                                                    currentPriority
                                                }
                                                isChecked={isChecked}
                                                onSelection={async () => {
                                                    const selectedArr =
                                                        modFiles.modProfileData
                                                            .filter(
                                                                (mfdf) =>
                                                                    mfdf.active,
                                                            )
                                                            .map(
                                                                (mfd) => mfd.id,
                                                            );

                                                    if (
                                                        selectedArr.includes(
                                                            item.id,
                                                        )
                                                    ) {
                                                        selectedArr.splice(
                                                            selectedArr.indexOf(
                                                                item.id,
                                                            ),
                                                            1,
                                                        );
                                                    } else {
                                                        selectedArr.push(
                                                            item.id,
                                                        );
                                                    }

                                                    let selectedModIds = [];
                                                    const selectedModFiles =
                                                        modFilesData.files.filter(
                                                            (mf) =>
                                                                selectedArr.includes(
                                                                    mf.id,
                                                                ),
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
                {showDeleteModModal.isOpen && (
                    <DeleteModModal
                        selectedModRow={showDeleteModModal.selectedModRow}
                        onModalStateChange={(newState) => {
                            setShowDeleteModModal(newState);
                        }}
                    />
                )}

                {showChangePriorityModModalState.isOpen && (
                    <ChangePriorityModal
                        selectedModRow={
                            showChangePriorityModModalState.selectedModRow
                        }
                        fromIndex={showChangePriorityModModalState.fromIndex}
                        onModalStateChange={(newState) => {
                            setShowChangePriorityModModal(newState);
                        }}
                        onChangePriority={async (toIndex) => {
                            if (
                                toIndex >
                                modFiles.tempModProfileData.length - 1
                            ) {
                                toIndex =
                                    modFiles.tempModProfileData.length - 1;
                            }

                            const mods = Array.from(
                                modFiles.tempModProfileData,
                            );
                            const [removed] = mods.splice(
                                showChangePriorityModModalState.fromIndex,
                                1,
                            );
                            mods.splice(toIndex, 0, removed);

                            runInAction(() => {
                                modFiles.modProfileData = mods;
                                modFiles.tempModProfileData = mods;
                            });

                            setShowChangePriorityModModal({
                                isOpen: false,
                                selectedModRow: null,
                                fromIndex: null,
                            });

                            await modFiles.saveModProfile();
                        }}
                    />
                )}

                {changeConflictModalState.isOpen && (
                    <ShowConflictsModal
                        selectedModRow={changeConflictModalState.selectedModRow}
                        state={changeConflictModalState}
                        onModalStateChange={(newState) => {
                            setShowConflictsModalClick(newState);
                        }}
                    />
                )}
            </div>
        </>
    );
}

export default observer(ModList);
