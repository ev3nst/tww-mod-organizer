import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';

const DownloadPathConfirmModal = ({ onConfirm, onCancel }) => {
    return (
        <Modal isOpen hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Download Mod
                </ModalHeader>
                <ModalBody>
                    File you are trying to download already exists.
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="warning"
                        onPress={async () => {
                            await onConfirm();
                        }}
                    >
                        Overwrite
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => {
                            onCancel();
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DownloadPathConfirmModal;
