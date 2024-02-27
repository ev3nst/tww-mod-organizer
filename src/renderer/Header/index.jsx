import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Button,
    Image,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import modFiles from '../../store/modFiles';
import downloadedFiles from '../../store/downloadedFiles';
import saveGameFiles from '../../store/saveGameFiles';

import InstallMod from './InstallMod';
import SwitchGames from './SwitchGames';
import Settings from './Settings';
import FilterMods from './FilterMods';

import appIcon from '../../../assets/icon.png';

const Header = () => {
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
                {/*
                <Dropdown>
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
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
                        <DropdownItem
                            key="usage_metrics"
                            description="Disconnect app from your currently logged in account."
                            startContent={icons.activity}
                        >
                            Disconnect
                        </DropdownItem>
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
                            */}

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
                                modFiles.getModConflicts(true);
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
