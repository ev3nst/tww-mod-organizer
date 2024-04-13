import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from '@nextui-org/react';
import { useState } from 'react';

const ChangePriorityModal = ({
    selectedModRow,
    fromIndex,
    onModalStateChange,
    onChangePriority,
}) => {
    const [toIndex, setToIndex] = useState();

    return (
        <Modal isOpen hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <p>Change Priority</p>
                    <em className="text-sm">{selectedModRow.title}</em>
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        variant="light"
                        label="From"
                        readOnly
                        value={fromIndex}
                    />
                    <Input
                        type="text"
                        variant="light"
                        label="To"
                        placeholder="Type the number of priority"
                        value={toIndex}
                        onValueChange={(value) => {
                            if (value === '') {
                                setToIndex('');
                            } else {
                                const reg = new RegExp('^[0-9]+$');
                                if (value.match(reg) !== null) {
                                    if (value < 0) {
                                        value = 0;
                                    }

                                    setToIndex(value);
                                }
                            }
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        onPress={() => {
                            onChangePriority(toIndex);
                        }}
                    >
                        Change
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => {
                            onModalStateChange({
                                isOpen: false,
                                selectedModRow: null,
                                fromIndex: null,
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

export default ChangePriorityModal;
