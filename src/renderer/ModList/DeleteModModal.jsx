import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';
import modFiles from '../../store/modFiles';

const DeleteModModal = ({ selectedModRow, onModalStateChange }) => {
    return (
        <Modal isOpen hideCloseButton>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Are you sure to unsubscribe/delete selected mod ?
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                If selected mod is from steam workshop then the
                                mod will be unsubscribed otherwise mod files
                                will be moved to trash.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="danger"
                                onPress={async () => {
                                    if (
                                        typeof selectedModRow.steamId !==
                                        'undefined'
                                    ) {
                                        await window.electronAPI.steamUnsubscribe(
                                            selectedModRow.steamId,
                                        );
                                    } else {
                                        await window.electronAPI.deleteMod(
                                            selectedModRow,
                                        );
                                    }

                                    const newModFiles = modFiles.files.filter(
                                        (mf) => mf.id !== selectedModRow.id,
                                    );

                                    const newModProfileData = [
                                        ...toJS(modFiles.modProfileData),
                                    ].filter(function (mf) {
                                        return mf.id !== selectedModRow.id;
                                    });

                                    runInAction(() => {
                                        modFiles.files = newModFiles;
                                        modFiles.modProfileData =
                                            newModProfileData;
                                        modFiles.tempModProfileData =
                                            newModProfileData;
                                    });

                                    onModalStateChange({
                                        isOpen: false,
                                        selectedModRow: null,
                                    });
                                }}
                            >
                                Yes
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => {
                                    onModalStateChange({
                                        isOpen: false,
                                        selectedModRow: null,
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default observer(DeleteModModal);
