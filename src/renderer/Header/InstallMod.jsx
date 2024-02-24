import { useRef, useState } from 'react';
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
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import modFiles from '../../store/modFiles';

const InstallMod = () => {
    const installModRef = useRef(null);
    const [installModName, setInstallModName] = useState('');
    const [installModConfirm, setInstallModConfirm] = useState({
        modInputKey: 0,
        isModalOpen: false,
        zipPath: '',
        defaultModName: '',
        showSameNameModInputs: false,
        sameNameAction: null,
    });

    return (
        <>
            <Button
                color="foreground"
                onClick={() => {
                    installModRef.current.click();
                }}
            >
                <ArchiveBoxIcon className="h-5 w-5" />
                Install Mod
            </Button>
            <input
                key={installModConfirm.modInputKey}
                className="hidden"
                ref={(ref) => (installModRef.current = ref)}
                type="file"
                accept=".7z,.rar,.zip"
                onChange={(event) => {
                    const zipPath = event.target.files[0].path;
                    setInstallModConfirm({
                        ...installModConfirm,
                        isModalOpen: true,
                        zipPath: zipPath,
                        defaultModName: zipPath
                            .substring(0, zipPath.lastIndexOf('.'))
                            .replace(/^.*[\\/]/, ''),
                    });
                }}
            />

            <Modal isOpen={installModConfirm.isModalOpen} hideCloseButton>
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
                            defaultValue={installModConfirm.defaultModName}
                            onChange={(event) => {
                                setInstallModName(event.target.value);
                            }}
                        />

                        {installModConfirm.showSameNameModInputs === true && (
                            <RadioGroup
                                label="Mod with same name exists. You can either select the options below or write a different name."
                                color="warning"
                                onChange={(event) => {
                                    setInstallModConfirm({
                                        ...installModConfirm,
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
                                    value="merge"
                                    description="Merges the contents of the archive with the existing ones."
                                >
                                    Merge
                                </Radio>
                            </RadioGroup>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onPress={async () => {
                                const modName =
                                    installModName ||
                                    installModConfirm.defaultModName;
                                const checkExistingMod =
                                    await window.electronAPI.checkExistingMod(
                                        modName,
                                    );

                                if (
                                    checkExistingMod &&
                                    installModConfirm.sameNameAction === null
                                ) {
                                    setInstallModConfirm({
                                        ...installModConfirm,
                                        showSameNameModInputs: true,
                                    });
                                    return;
                                }

                                const newModMeta =
                                    await window.electronAPI.installMod(
                                        modName,
                                        installModConfirm.zipPath,
                                        installModConfirm.sameNameAction,
                                    );

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
                                        modFiles.modProfileData =
                                            newModProfileData;
                                        modFiles.tempModProfileData =
                                            newModProfileData;
                                    });
                                }

                                setInstallModConfirm({
                                    modInputKey: Date.now(),
                                    isModalOpen: false,
                                    zipPath: '',
                                    defaultModName: '',
                                    showSameNameModInputs: false,
                                    sameNameAction: null,
                                });
                            }}
                        >
                            Install
                        </Button>
                        <Button
                            onPress={() => {
                                setInstallModConfirm({
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
        </>
    );
};

export default observer(InstallMod);
