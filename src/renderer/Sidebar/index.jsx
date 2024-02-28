import { useState } from 'react';
import { Tabs, Tab, Card, CardBody, Button, Spinner } from '@nextui-org/react';
import { FolderOpenIcon } from '@heroicons/react/24/solid';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';

import SaveGames from './SaveGames';
import modFiles from '../../store/modFiles';

/*
function onNxmLinkReceived() {
    window.electronAPI.onNxmLinkReceived((downloadRequestLink) => {
        const requestOptions = {};
        if (
            downloadRequestLink.startsWith('nxm://totalwarwarhammer') === false
        ) {
            toast.error('Requested download link is not supported.');
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
            window.electronAPI.getNexusDownloadLink(requestOptions);
        } else {
            toast.error('Requested download link could not be parsed.');
            return;
        }
    });
}
*/

function Sidebar() {
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
                <Tabs aria-label="Options" variant="bordered" fullWidth>
                    <Tab
                        key="saves"
                        title={
                            <div className="flex items-center space-x-2">
                                <FolderOpenIcon className="h-5 w-5" />
                                <span>SAVES</span>
                            </div>
                        }
                    >
                        <Card className="bg-zinc-950/90">
                            <CardBody>
                                <SaveGames />
                            </CardBody>
                        </Card>
                    </Tab>
                    {/*
                    <Tab
                        key="downloads"
                        title={
                            <div className="flex items-center space-x-2">
                                <CloudArrowDownIcon className="h-5 w-5 text-blue-500" />
                                <span>DOWNLOADS</span>
                            </div>
                        }
                    >
                        <Card>
                            <CardBody>
                                <Downloads />
                            </CardBody>
                        </Card>
                    </Tab>
                    */}
                </Tabs>
            </div>
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
                    window.electronAPI.startGame(modProfileData, modListData);
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
