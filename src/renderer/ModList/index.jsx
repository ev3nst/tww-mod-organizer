import { useEffect, useState } from 'react';
import { Spinner } from '@nextui-org/react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import modFiles from '../../store/modFiles';
import DeleteModModal from './DeleteModModal';
import ChangePriorityModal from './ChangePriorityModal';
import ShowConflictsModal from './ShowConflictsModal';
import ModProfiles from './ModProfiles';
import ModOrdering from './ModOrdering';
import ModTable from './ModTable';

async function initData() {
    await modFiles.getFiles();
    await modFiles.getModProfile();
}

function ModList() {
    useEffect(() => {
        initData();
    }, []);

    const selectedKeys = new Set([]);
    if (
        typeof modFiles.files !== 'undefined' &&
        modFiles.files !== null &&
        modFiles.files.length > 0
    ) {
        for (let macti = 0; macti < modFiles.modProfileData.length; macti++) {
            const modProfData = modFiles.modProfileData[macti];
            if (modProfData.active === true) {
                const indx = modFiles.files.findIndex(
                    (fi) => fi.id === modProfData.id,
                );
                if (typeof modFiles.files[indx] !== 'undefined') {
                    selectedKeys.add(modFiles.files[indx].title);
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

    if (modFiles.filesLoading || modFiles.modProfileLoading) {
        return <Spinner />;
    }

    return (
        <>
            {modFiles.searchFilter.length === 0 && <ModProfiles />}
            <div className="flex">
                {modFiles.searchFilter.length === 0 && <ModOrdering />}
                <ModTable
                    setShowDeleteModModal={setShowDeleteModModal}
                    setShowChangePriorityModModal={
                        setShowChangePriorityModModal
                    }
                    setShowConflictsModalClick={setShowConflictsModalClick}
                />
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
