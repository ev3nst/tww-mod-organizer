import { useRef, useState } from 'react';
import { Button } from '@nextui-org/react';
import { observer } from 'mobx-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import InstallModModal from '../Components/InstallModModal';
import InstallModalState from '../Components/InstallModalState';

const InstallMod = () => {
    const installModRef = useRef(null);
    const [installModConfirm, setInstallModConfirm] =
        useState(InstallModalState);

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
                key={Date.now()}
                className="hidden"
                ref={(ref) => (installModRef.current = ref)}
                type="file"
                accept=".7z,.rar,.zip"
                onChange={(event) => {
                    const zipPath = event.target.files[0].path;
                    const modConfirmDetails = {
                        isModalOpen: true,
                        zipPath,
                        defaultModName: zipPath
                            .substring(0, zipPath.lastIndexOf('.'))
                            .replace(/^.*[\\/]/, ''),
                    };

                    setInstallModConfirm(modConfirmDetails);
                }}
            />
            <InstallModModal
                key="header_InstallModModal"
                confirmOpts={installModConfirm}
                onModConfirm={(state) => {
                    setInstallModConfirm(state);
                }}
            />
        </>
    );
};

export default observer(InstallMod);
