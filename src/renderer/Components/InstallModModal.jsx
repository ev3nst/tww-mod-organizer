import { useState } from 'react';
import {
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    RadioGroup,
    Radio,
} from '@nextui-org/react';
import { runInAction, toJS } from 'mobx';
import toast from 'react-hot-toast';
import modFiles from '../../store/modFiles';

const InstallModModal = ({ confirmOpts, onModConfirm }) => {
    const [installModName, setInstallModName] = useState(
        confirmOpts.defaultModName,
    );

    return (
        <Modal isOpen={confirmOpts.isModalOpen} hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Install Mod
                </ModalHeader>
                <ModalBody>
                    <Input
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        label="Name"
                        placeholder="Provide name for this mod"
                        required
                        variant="bordered"
                        defaultValue={confirmOpts.defaultModName}
                        onChange={(event) => {
                            setInstallModName(event.target.value);
                        }}
                    />

                    {confirmOpts.showSameNameModInputs === true && (
                        <RadioGroup
                            label="Mod with same name exists. You can either select the options below or write a different name."
                            color="warning"
                            onChange={(event) => {
                                onModConfirm({
                                    ...confirmOpts,
                                    sameNameAction: event.target.value,
                                });
                            }}
                        >
                            <Radio
                                value="replace"
                                description="Replace the contents of the mod with the new archive."
                            >
                                Replace
                            </Radio>
                            <Radio
                                className="hidden"
                                value="merge"
                                description="Merges the contents of the archive with the existing ones."
                            >
                                Merge
                            </Radio>
                        </RadioGroup>
                    )}

                    {confirmOpts.hasMultiplePacks === true && (
                        <RadioGroup
                            label="This archive contains multiple .pack files. They can to be installed separetely into their own unique mod folder. Choose which .pack file to install."
                            color="warning"
                            onChange={(event) => {
                                onModConfirm({
                                    ...confirmOpts,
                                    packFileName: event.target.value,
                                });
                            }}
                        >
                            {confirmOpts.multiplePacks.map((mp) => (
                                <Radio
                                    key={`multiple_pack_radio_${mp}`}
                                    value={mp}
                                >
                                    {mp}
                                </Radio>
                            ))}
                        </RadioGroup>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={async () => {
                            const modName =
                                installModName || confirmOpts.defaultModName;
                            const checkExistingMod =
                                await window.electronAPI.checkExistingMod(
                                    modName,
                                );

                            const zipContents =
                                await window.electronAPI.checkModZipFiles(
                                    confirmOpts.zipPath,
                                );

                            if (zipContents === null) {
                                return;
                            }

                            let packFileName = '';
                            let hasMultiplePacks = false;
                            if (
                                typeof zipContents !== 'undefined' &&
                                zipContents !== null &&
                                typeof zipContents[0] !== 'undefined'
                            ) {
                                if (zipContents.length > 1) {
                                    hasMultiplePacks = true;
                                }

                                if (zipContents.length === 1) {
                                    packFileName = zipContents[0];
                                }

                                if (zipContents.length === 0) {
                                    toast.error(
                                        'This zip file does not contain .pack file. ',
                                    );
                                    return;
                                }
                            }

                            if (
                                checkExistingMod &&
                                confirmOpts.sameNameAction === null
                            ) {
                                onModConfirm({
                                    ...confirmOpts,
                                    showSameNameModInputs: true,
                                    hasMultiplePacks,
                                });
                                return;
                            }

                            if (
                                hasMultiplePacks &&
                                confirmOpts.packFileName === ''
                            ) {
                                onModConfirm({
                                    ...confirmOpts,
                                    showSameNameModInputs: false,
                                    hasMultiplePacks,
                                    packFileName,
                                    multiplePacks: zipContents,
                                });
                                return;
                            }

                            if (
                                typeof confirmOpts.packFileName ===
                                    'undefined' ||
                                confirmOpts.packFileName.length === 0
                            ) {
                                if (zipContents.length > 1) {
                                    onModConfirm({
                                        ...confirmOpts,
                                        hasMultiplePacks: true,
                                        multiplePacks: zipContents,
                                    });
                                    return;
                                }
                            }

                            const newModMeta =
                                await window.electronAPI.installMod(
                                    modName,
                                    confirmOpts.zipPath,
                                    confirmOpts.sameNameAction,
                                    confirmOpts.packFileName || packFileName,
                                );

                            if (typeof newModMeta === 'undefined') {
                                toast.error(
                                    'Unexpected error when unzipping the archive',
                                );
                                return;
                            }

                            if (
                                typeof newModMeta !== 'undefined' &&
                                typeof newModMeta.error !== 'undefined'
                            ) {
                                toast.error(newModMeta.error);
                                return;
                            }

                            const modFilesData = toJS(modFiles.files);
                            if (
                                modFilesData.filter(
                                    (mfd) => mfd.title === modName,
                                ).length === 0
                            ) {
                                const newModFiles = [
                                    ...modFilesData,
                                    newModMeta,
                                ];
                                const newModProfileData = [
                                    ...toJS(modFiles.modProfileData),
                                ];
                                newModProfileData.push({
                                    id: newModMeta.id,
                                    active: true,
                                });
                                runInAction(() => {
                                    modFiles.files = newModFiles;
                                    modFiles.modProfileData = newModProfileData;
                                    modFiles.tempModProfileData =
                                        newModProfileData;
                                });
                            }

                            onModConfirm({
                                modInputKey: Date.now(),
                                isModalOpen: false,
                                zipPath: '',
                                defaultModName: '',
                                showSameNameModInputs: false,
                                sameNameAction: null,
                                multiplePacks: [],
                            });

                            await modFiles.getFiles();
                            await modFiles.getModConflicts();
                        }}
                    >
                        Install
                    </Button>
                    <Button
                        onPress={() => {
                            onModConfirm({
                                modInputKey: Date.now(),
                                isModalOpen: false,
                                zipPath: '',
                                defaultModName: '',
                                showSameNameModInputs: false,
                                sameNameAction: null,
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

export default InstallModModal;
