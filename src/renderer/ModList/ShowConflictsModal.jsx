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

const ShowConflictsModal = ({
    selectedModRow,
    conflicts,
    modFilesData,
    onModalStateChange,
}) => {
    const currentPriority = modFilesData.modProfileData.findIndex(
        function (modData) {
            return modData.id === selectedModRow.id;
        },
    );
    const win = {};
    const lose = {};

    for (const packFileName in conflicts) {
        if (Object.hasOwnProperty.call(conflicts, packFileName)) {
            const otherModPacks = conflicts[packFileName];

            for (let ompi = 0; ompi < otherModPacks.length; ompi++) {
                const otherModPack = otherModPacks[ompi];

                const index = modFilesData.files.findIndex((mf) => {
                    return mf.packFileName === otherModPack;
                });

                const conflictedModPriority =
                    modFilesData.modProfileData.findIndex(function (modData) {
                        return modData.id === modFilesData.files[index].id;
                    });
                if (currentPriority > conflictedModPriority) {
                    if (typeof win[packFileName] === 'undefined') {
                        win[packFileName] = [];
                    }
                    win[packFileName].push(modFilesData.files[index].title);
                } else {
                    if (typeof lose[packFileName] === 'undefined') {
                        lose[packFileName] = [];
                    }
                    lose[packFileName].push(modFilesData.files[index].title);
                }
            }
        }
    }

    const winKeys = Object.keys(win);
    const loseKeys = Object.keys(lose);

    // It is winnig againts upper files but in the end conflcit is won by 3rd party
    for (let li = 0; li < loseKeys.length; li++) {
        const loseKey = loseKeys[li];
        if (winKeys.includes(loseKey)) {
            winKeys.splice(winKeys.indexOf(loseKey), 1);
        }
    }

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
                            title={`Winning conflicts ${winKeys.length > 0 ? ' - ' + winKeys.length : ''}`}
                        >
                            <ScrollShadow
                                hideScrollBar
                                className="max-h-[250px]"
                                size={20}
                            >
                                {winKeys.map((winningFileName) => (
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
                                        {win[winningFileName].map(
                                            (otherModPackName) => (
                                                <em
                                                    key={`conflict_modal_${selectedModRow.id}_${winningFileName}_${otherModPackName}`}
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
                        <AccordionItem
                            key="lose"
                            aria-label="Losing conflicts"
                            title={`Losing conflicts ${loseKeys.length > 0 ? ' - ' + loseKeys.length : ''}`}
                        >
                            <ScrollShadow
                                hideScrollBar
                                className="max-h-[250px]"
                                size={20}
                            >
                                {loseKeys.map((losingFileName) => (
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
                                        {lose[losingFileName].map(
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
                                conflicts: null,
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
