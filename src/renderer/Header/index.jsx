import { useEffect } from 'react';
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Button,
    Image,
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    DropdownItem,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import settings from '../../store/settings';
import modFiles from '../../store/modFiles';
import downloadedFiles from '../../store/downloadedFiles';
import saveGameFiles from '../../store/saveGameFiles';
import supportedGames from '../../store/supportedGames.js';

import InstallMod from './InstallMod';
import SwitchGames from './SwitchGames';
import Settings from './Settings';
import FilterMods from './FilterMods';

import { Activity, Flash, Server, TagUser, Scale } from '../Icons';
import appIcon from '../../../assets/icon.png';
import nexusLogo from '../../../assets/nexus-logo.png';
import dbKeys from '../../main/db/keys';

const icons = {
    scale: <Scale className="text-warning" fill="currentColor" size={30} />,
    activity: (
        <Activity className="text-secondary" fill="currentColor" size={30} />
    ),
    flash: <Flash className="text-primary" fill="currentColor" size={30} />,
    server: <Server className="text-success" fill="currentColor" size={30} />,
    user: <TagUser className="text-danger" fill="currentColor" size={30} />,
};

const Header = () => {
    useEffect(() => {
        downloadedFiles.checkNexusAPI();
        // failsafe check for db delay
        setTimeout(async () => {
            await downloadedFiles.checkNexusAPI();
        }, 3000);
    }, []);

    return (
        <Navbar maxWidth="full" isBordered>
            <Image
                src={appIcon}
                style={{
                    width: '50px',
                    height: '50px',
                }}
            />
            <NavbarContent justify="start">
                <SwitchGames />
                <Dropdown>
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className={`p-0 bg-transparent data-[hover=true]:bg-transparent ${downloadedFiles.hasNexusAPI ? 'text-success' : ''}`}
                                radius="sm"
                                variant="light"
                                startContent={
                                    <Image
                                        src={nexusLogo}
                                        width={20}
                                        height={20}
                                    />
                                }
                            >
                                NEXUS
                            </Button>
                        </DropdownTrigger>
                    </NavbarItem>
                    <DropdownMenu
                        aria-label="ACME features"
                        className="w-[340px]"
                        itemClasses={{
                            base: 'gap-4',
                        }}
                    >
                        {downloadedFiles.hasNexusAPI === false ? (
                            <DropdownItem
                                key="autoscaling"
                                description="Nexus related features such as endorsing, version checking and downloading directly with the app."
                                startContent={icons.scale}
                                onClick={() => {
                                    window.electronAPI.nexusInitAuth();
                                }}
                            >
                                Login
                            </DropdownItem>
                        ) : (
                            <DropdownItem
                                key="usage_metrics"
                                description="Disconnect app from your currently logged in account."
                                startContent={icons.activity}
                                onClick={async () => {
                                    await window.electronAPI.dbSet(
                                        dbKeys.NEXUS_API_KEY,
                                        null,
                                    );
                                }}
                            >
                                Disconnect
                            </DropdownItem>
                        )}

                        <DropdownItem
                            key="production_ready"
                            description="Visit nexus mods for browsing."
                            startContent={icons.flash}
                            onClick={() => {
                                const managedGameDetails =
                                    supportedGames.filter(
                                        (sgf) =>
                                            sgf.slug === settings.managedGame,
                                    )[0];
                                window.electronAPI.openExternalLink(
                                    `https://www.nexusmods.com/${managedGameDetails.nexusSlug}`,
                                );
                            }}
                        >
                            Visit Mods
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <NavbarContent className="hidden sm:flex">
                    <NavbarItem>
                        <InstallMod />
                    </NavbarItem>
                    <NavbarItem>
                        <Button
                            color="foreground"
                            onClick={async () => {
                                await modFiles.getFiles();
                                await modFiles.getModProfile();
                                await saveGameFiles.getFiles();
                                await downloadedFiles.getFiles();
                                await downloadedFiles.checkNexusAPI();
                                modFiles.getModConflicts();
                            }}
                        >
                            <ArrowPathIcon className="h-5 w-5 text-green-500" />
                            Refresh
                        </Button>
                    </NavbarItem>
                    <Settings />
                </NavbarContent>
            </NavbarContent>

            <NavbarContent as="div" className="items-center" justify="end">
                <Button color="foreground">
                    Mod Count: {modFiles.files.length}
                </Button>
                <FilterMods />
            </NavbarContent>
        </Navbar>
    );
};

export default observer(Header);
