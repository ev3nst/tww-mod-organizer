import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import saveGameFiles from '../../store/saveGameFiles';

const DeleteSaveFilesModal = ({ selectedSaveFiles, onModalStateChange }) => {
    return (
        <Modal isOpen hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Are you sure to delete these save files ?
                </ModalHeader>
                <ModalBody>
                    {selectedSaveFiles.map((ssf) => (
                        <em
                            key={`delete_save_files_${ssf}`}
                            className="block text-sm text-danger"
                        >
                            {ssf}
                        </em>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        onPress={async () => {
                            await window.electronAPI.deleteSaveFiles(
                                selectedSaveFiles,
                            );

                            const newFilesList = saveGameFiles.files.filter(
                                function (objFromA) {
                                    return !selectedSaveFiles.find(
                                        function (objFromB) {
                                            return objFromA.name === objFromB;
                                        },
                                    );
                                },
                            );

                            onModalStateChange({
                                isOpen: false,
                                selectedSaveFiles: [],
                            });
                            runInAction(() => {
                                saveGameFiles.files = newFilesList;
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
                                selectedSaveFiles: [],
                            });
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default observer(DeleteSaveFilesModal);
