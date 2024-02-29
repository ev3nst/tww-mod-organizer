import {
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Accordion,
    AccordionItem,
    ScrollShadow,
} from '@nextui-org/react';

const ShowConflictsModal = ({ selectedModRow, onModalStateChange, state }) => {
    return (
        <Modal size="5xl" isOpen hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <p>Show Conflicts</p>
                    <em className="text-sm">{selectedModRow.title}</em>
                </ModalHeader>
                <ModalBody>
                    <Accordion
                        variant="bordered"
                        selectionMode="multiple"
                        defaultExpandedKeys={['win', 'lose']}
                    >
                        <AccordionItem
                            key="win"
                            aria-label="Winning conflicts"
                            title={`Winning conflicts ${state.winKeys.length > 0 ? ' - ' + state.winKeys.length : ''}`}
                        >
                            <ScrollShadow
                                hideScrollBar
                                className="max-h-[250px]"
                                size={20}
                            >
                                {state.winKeys.map((winningFileName) => (
                                    <div
                                        className="mb-1"
                                        key={`conflict_modal_${selectedModRow.id}_${winningFileName}_win`}
                                    >
                                        <em
                                            className="text-sm block text-success"
                                            key={`conflict_modal_${selectedModRow.id}_${winningFileName}`}
                                        >
                                            {winningFileName}
                                        </em>
                                        {state.win[winningFileName].map(
                                            (otherModPackName) => (
                                                <em
                                                    key={`conflict_modal_${selectedModRow.id}_${winningFileName}_${otherModPackName}`}
                                                    className="pl-5 text-sm block"
                                                >
                                                    {otherModPackName}
                                                </em>
                                            ),
                                        )}
                                    </div>
                                ))}
                            </ScrollShadow>
                        </AccordionItem>
                        <AccordionItem
                            key="lose"
                            aria-label="Losing conflicts"
                            title={`Losing conflicts ${state.loseKeys.length > 0 ? ' - ' + state.loseKeys.length : ''}`}
                        >
                            <ScrollShadow
                                hideScrollBar
                                className="max-h-[250px]"
                                size={20}
                            >
                                {state.loseKeys.map((losingFileName) => (
                                    <div
                                        className="mb-1"
                                        key={`conflict_modal_${selectedModRow.id}_${losingFileName}_lose`}
                                    >
                                        <em
                                            className="text-sm block text-danger"
                                            key={`conflict_modal_${losingFileName}`}
                                        >
                                            {losingFileName}
                                        </em>
                                        {state.lose[losingFileName].map(
                                            (otherModPackName) => (
                                                <em
                                                    key={`conflict_modal_${selectedModRow.id}_${losingFileName}_${otherModPackName}`}
                                                    className="pl-5 text-sm"
                                                >
                                                    {otherModPackName}
                                                </em>
                                            ),
                                        )}
                                    </div>
                                ))}
                            </ScrollShadow>
                        </AccordionItem>
                    </Accordion>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={() => {
                            onModalStateChange({
                                isOpen: false,
                                selectedModRow: null,
                                win: {},
                                winKeys: [],
                                lose: {},
                                loseKeys: [],
                            });
                        }}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ShowConflictsModal;
