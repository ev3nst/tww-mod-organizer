import { useEffect, useRef, useState } from 'react';
import {
    NavbarItem,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
} from '@nextui-org/react';
import { Cog6ToothIcon, EyeIcon, FolderIcon } from '@heroicons/react/24/solid';
import dbKeys from '../../main/db/keys';

const Settings = () => {
    const modInstallPathRef = useRef(null);
    const downloadsPathRef = useRef(null);
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
            <Modal
                isOpen={settingsModal}
                size="3xl"
                onClose={() => setSettingsModal(false)}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Settings
                    </ModalHeader>
                    <ModalBody className="pb-6">
                        <Card>
                            <CardHeader className="flex gap-3">
                                <div className="flex flex-col">
                                    <b className="text-md">
                                        Mod Installation Path
                                    </b>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <em className="text-sm">
                                    {modInstallationPath}
                                </em>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <div className="w-full flex justify-between">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="subpixel-antialiased"
                                        endContent={
                                            <FolderIcon
                                                width={20}
                                                height={20}
                                            />
                                        }
                                        onClick={() => {
                                            modInstallPathRef.current.click();
                                        }}
                                    >
                                        Choose which path for mods to be
                                        installed
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="subpixel-antialiased"
                                        endContent={
                                            <EyeIcon width={20} height={20} />
                                        }
                                        onClick={() => {
                                            window.electronAPI.showItemInFolder(
                                                modInstallationPath,
                                            );
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                                <input
                                    ref={(ref) =>
                                        (modInstallPathRef.current = ref)
                                    }
                                    className="hidden"
                                    type="file"
                                    webkitdirectory=""
                                    onChange={async (event) => {
                                        if (
                                            typeof event.target.value !==
                                                'undefined' &&
                                            event.target.value !== null &&
                                            String(event.target.value).length >
                                                0
                                        ) {
                                            const directoryPath =
                                                await window.electronAPI.pathDirname(
                                                    event.target.files[0].path,
                                                );
                                            await window.electronAPI.dbSet(
                                                dbKeys.MOD_INSTALLATION_FOLDER,
                                                directoryPath,
                                            );
                                            setModInstallationPath(
                                                directoryPath,
                                            );
                                        }
                                    }}
                                />
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="flex gap-3">
                                <div className="flex flex-col">
                                    <b className="text-md">Downloads Path</b>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <em className="text-sm">{downloadModPath}</em>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <div className="w-full flex justify-between">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="subpixel-antialiased"
                                        endContent={
                                            <FolderIcon
                                                width={20}
                                                height={20}
                                            />
                                        }
                                        onClick={() => {
                                            downloadsPathRef.current.click();
                                        }}
                                    >
                                        Choose which path for archives to be
                                        downloaded
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="subpixel-antialiased"
                                        endContent={
                                            <EyeIcon width={20} height={20} />
                                        }
                                        onClick={() => {
                                            window.electronAPI.showItemInFolder(
                                                downloadModPath,
                                            );
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                                <input
                                    ref={(ref) =>
                                        (downloadsPathRef.current = ref)
                                    }
                                    className="hidden"
                                    type="file"
                                    webkitdirectory=""
                                    onChange={async (event) => {
                                        if (
                                            typeof event.target.value !==
                                                'undefined' &&
                                            event.target.value !== null &&
                                            String(event.target.value).length >
                                                0
                                        ) {
                                            const directoryPath =
                                                await window.electronAPI.pathDirname(
                                                    event.target.files[0].path,
                                                );
                                            await window.electronAPI.dbSet(
                                                dbKeys.MOD_DOWNLOAD_FOLDER,
                                                directoryPath,
                                            );
                                            setModInstallationPath(
                                                directoryPath,
                                            );
                                        }
                                    }}
                                />
                            </CardFooter>
                        </Card>

                        <p className="text-warning text-sm">
                            Contents of the paths will not be moved. Please move
                            the contents manually.
                        </p>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Settings;
