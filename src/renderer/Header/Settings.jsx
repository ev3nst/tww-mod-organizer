import { useEffect, useState } from 'react';
import {
    NavbarItem,
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';
import { Cog6ToothIcon, FolderIcon } from '@heroicons/react/24/solid';
import dbKeys from '../../main/db/keys';

const ModInstallPathIcon = () => {
    return (
        <Button
            variant="light"
            onClick={async () => {
                const modInstallationFolder = await window.electronAPI.dbGet(
                    dbKeys.MOD_INSTALLATION_FOLDER,
                );
                window.electronAPI.showItemInFolder(modInstallationFolder);
            }}
        >
            <FolderIcon width={30} height={30} />
        </Button>
    );
};

const Settings = () => {
    const [settingsModal, setSettingsModal] = useState(false);

    const [modInstallationPath, setModInstallationPath] = useState('');
    const [downloadModPath, setDownloadModPath] = useState('');

    useEffect(() => {
        async function getCurrentSettings() {
            const modInstallationFolder = await window.electronAPI.dbGet(
                dbKeys.MOD_INSTALLATION_FOLDER,
            );
            if (modInstallationPath.length === 0) {
                setModInstallationPath(modInstallationFolder);
            }

            const downloadModFolder = await window.electronAPI.dbGet(
                dbKeys.MOD_DOWNLOAD_FOLDER,
            );
            if (downloadModPath.length === 0) {
                setDownloadModPath(downloadModFolder);
            }
        }

        getCurrentSettings();
    }, [downloadModPath.length, modInstallationPath.length]);

    return (
        <>
            <NavbarItem isActive>
                <Button
                    color="foreground"
                    onClick={() => {
                        setSettingsModal(true);
                    }}
                >
                    <Cog6ToothIcon className="h-5 w-5" />
                    Settings
                </Button>
            </NavbarItem>
            <Modal isOpen={settingsModal} size="3xl" hideCloseButton>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Settings
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            size="lg"
                            type="text"
                            label="Mod Installation Path"
                            placeholder="Choose which path for mods to be installed"
                            value={modInstallationPath}
                            endContent={<ModInstallPathIcon />}
                            onChange={(event) =>
                                setModInstallationPath(event.target.value)
                            }
                        />
                        <Input
                            size="lg"
                            type="text"
                            label="Downloads Path"
                            placeholder="Choose which path for archives to be downloaded"
                            value={downloadModPath}
                            onChange={(event) =>
                                setDownloadModPath(event.target.value)
                            }
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onPress={async () => {
                                if (modInstallationPath.length > 0) {
                                    await window.electronAPI.dbSet(
                                        dbKeys.MOD_INSTALLATION_FOLDER,
                                        modInstallationPath,
                                    );
                                }

                                if (downloadModPath.length > 0) {
                                    await window.electronAPI.dbSet(
                                        dbKeys.MOD_DOWNLOAD_FOLDER,
                                        downloadModPath,
                                    );
                                }

                                setSettingsModal(false);
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            onPress={() => {
                                setSettingsModal(false);
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

export default Settings;
