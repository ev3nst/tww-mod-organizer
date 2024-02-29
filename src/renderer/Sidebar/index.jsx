import { useEffect, useState } from 'react';
import { Tabs, Tab, Card, CardBody, Button, Spinner } from '@nextui-org/react';
import { CloudArrowDownIcon, FolderOpenIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';

import modFiles from '../../store/modFiles';
import saveGameFiles from '../../store/saveGameFiles';
import settings from '../../store/settings';
import downloadedFiles from '../../store/downloadedFiles';
import dbKeys from '../../main/db/keys';

import SaveGames from './SaveGames';
import Downloads from './Downloads';
import DownloadPathConfirmModal from './DownloadPathConfirmModal';

async function nxmLinkHandler(downloadRequestLink, onSameExits) {
    const requestOptions = {};
    if (downloadRequestLink.startsWith('nxm://totalwarwarhammer') === false) {
        toast.error('Requested download link is not supported.');
        return;
    }

    const nexusAPIKey = await window.electronAPI.dbGet(dbKeys.NEXUS_API_KEY);
    if (
        typeof nexusAPIKey === 'undefined' ||
        nexusAPIKey === null ||
        String(nexusAPIKey).length === 0
    ) {
        toast.error(
            'You need to login to Nexus Mods to download directly from the app.',
        );
        return;
    }

    const downloadLinkExp = downloadRequestLink.split('/');
    if (
        typeof downloadLinkExp !== 'undefined' &&
        Array.isArray(downloadLinkExp) &&
        downloadLinkExp.length === 7
    ) {
        const searchParams = new URL(downloadRequestLink).searchParams;
        requestOptions.gameDomainName = downloadLinkExp[2];
        requestOptions.fileId = downloadLinkExp[6].split('?')[0];
        requestOptions.modId = downloadLinkExp[4];
        requestOptions.downloadKey = searchParams.get('key');
        requestOptions.downloadExpires = searchParams.get('expires');

        const generatedLink =
            await window.electronAPI.getNexusDownloadLink(requestOptions);
        const generatedLinkURL = new URL(generatedLink);
        const fileName = generatedLinkURL.pathname.split('/')[3];

        const downloadsPath = await window.electronAPI.dbGet(
            dbKeys.MOD_DOWNLOAD_FOLDER,
        );
        const gameSpecificDownloadPath = `${downloadsPath}\\${settings.managedGame}`;
        const downloadModPath = `${gameSpecificDownloadPath}\\${fileName}`;
        const doesPathAlreadyExists =
            await window.electronAPI.checkExistingDownload(downloadModPath);

        const downloadOpts = {
            url: generatedLink,
            fileName,
            path: downloadModPath,
        };

        if (doesPathAlreadyExists) {
            onSameExits({
                isOpen: true,
                downloadOpts,
            });
            return;
        }

        runInAction(() => {
            downloadedFiles.files.push({
                ...downloadOpts,
                size: 0,
                date: new Date(),
                name: fileName,
            });
        });
        toast.success('Download started for: ' + downloadOpts.fileName);
        await window.electronAPI.streamDownload(downloadOpts);
        return true;
    } else {
        toast.error('Requested download link could not be parsed.');
        return false;
    }
}

function Sidebar() {
    useEffect(() => {
        window.electronAPI.onNxmLinkReceived(async (downloadRequestLink) => {
            nxmLinkHandler(downloadRequestLink, (sameFileExistsState) => {
                setDownloadPathConfirm(sameFileExistsState);
            });
        });

        window.electronAPI.onStreamDownloadProgress((progressData) => {
            const downloadedFilesData = toJS(downloadedFiles.files);
            const progIndex = downloadedFilesData.findIndex(
                (ff) => ff.name === progressData.fileName,
            );
            downloadedFilesData[progIndex] = {
                ...downloadedFilesData[progIndex],
                ...progressData,
            };
            runInAction(() => {
                downloadedFiles.files = downloadedFilesData;
            });
        });
    }, []);

    const [downloadPathConfirm, setDownloadPathConfirm] = useState({
        isOpen: false,
        downloadOpts: undefined,
    });
    const [isGameStarting, setIsGameStarting] = useState(false);
    const modProfileData = toJS(modFiles.modProfileData);
    const modListData = toJS(toJS(modFiles.files));

    return (
        <div className="flex flex-col justify-between h-full">
            <div
                className="overflow-auto"
                style={{
                    maxHeight: 'calc(100% - 100px)',
                }}
            >
                <Tabs
                    aria-label="Options"
                    variant="bordered"
                    fullWidth
                    defaultSelectedKey="downloads"
                >
                    <Tab
                        key="saves"
                        title={
                            <div className="flex items-center space-x-2">
                                <FolderOpenIcon className="h-5 w-5" />
                                <span>SAVES</span>
                            </div>
                        }
                    >
                        <Card className="bg-zinc-950/85">
                            <CardBody>
                                <SaveGames />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab
                        key="downloads"
                        title={
                            <div className="flex items-center space-x-2">
                                <CloudArrowDownIcon className="h-5 w-5 text-blue-500" />
                                <span>DOWNLOADS</span>
                            </div>
                        }
                    >
                        <Card className="bg-zinc-950/85">
                            <CardBody>
                                <Downloads />
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
            {downloadPathConfirm.isOpen === true && (
                <DownloadPathConfirmModal
                    onConfirm={async () => {
                        toast.success(
                            'Download started for: ' +
                                downloadPathConfirm.downloadOpts.fileName,
                        );

                        runInAction(() => {
                            const sameFileIndex =
                                downloadedFiles.files.findIndex(
                                    (ff) =>
                                        ff.name ===
                                        downloadPathConfirm.downloadOpts
                                            .fileName,
                                );

                            downloadedFiles.files[sameFileIndex] = {
                                ...downloadPathConfirm.downloadOpts,
                                size: 0,
                                date: new Date(),
                                name: downloadPathConfirm.downloadOpts.fileName,
                            };
                        });

                        await window.electronAPI.streamDownload(
                            downloadPathConfirm.downloadOpts,
                            true,
                        );

                        setDownloadPathConfirm({
                            isOpen: false,
                            downloadOpts: undefined,
                        });
                    }}
                    onCancel={() => {
                        setDownloadPathConfirm({
                            isOpen: false,
                            downloadOpts: undefined,
                        });
                    }}
                />
            )}

            <Button
                className={`h-20 text-2xl ml-1 mt-5 ${isGameStarting ? 'disabled' : ''}`}
                size="lg"
                color="primary"
                variant="shadow"
                endContent={
                    isGameStarting ? (
                        <Spinner color="white" size="sm" />
                    ) : undefined
                }
                disabled={isGameStarting}
                onClick={() => {
                    window.electronAPI.startGame(
                        modProfileData,
                        modListData,
                        saveGameFiles.startupSaveGame,
                    );
                    setIsGameStarting(true);
                    setTimeout(() => {
                        setIsGameStarting(false);
                    }, 4500);
                }}
            >
                LAUNCH
            </Button>
        </div>
    );
}

export default observer(Sidebar);
