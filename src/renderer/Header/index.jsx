import { useRef } from 'react';
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Input,
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    Avatar,
    Button,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import {
    ArrowPathIcon,
    Cog6ToothIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/solid';

import settings from '../../store/settings';
import {
    ChevronDown,
    Activity,
    Flash,
    Server,
    TagUser,
    Scale,
    Search,
} from './Icons.jsx';
import { supportedGames } from '../../store/constants.js';

const Header = () => {
    const gameRefs = useRef({});
    const currentGameDetails = supportedGames.find((obj) => {
        return obj.slug === settings.managedGame;
    });
    const icons = {
        chevron: <ChevronDown fill="currentColor" size={16} />,
        scale: <Scale className="text-warning" fill="currentColor" size={30} />,
        activity: (
            <Activity
                className="text-secondary"
                fill="currentColor"
                size={30}
            />
        ),
        flash: <Flash className="text-primary" fill="currentColor" size={30} />,
        server: (
            <Server className="text-success" fill="currentColor" size={30} />
        ),
        user: <TagUser className="text-danger" fill="currentColor" size={30} />,
    };

    return (
        <Navbar maxWidth={'full'} isBordered>
            <NavbarContent justify="start">
                {supportedGames.map((gameDetails) => (
                    <input
                        key={`navbar_game_input_${gameDetails.slug}`}
                        className="hidden"
                        ref={(ref) =>
                            (gameRefs.current[gameDetails.slug] = ref)
                        }
                        type="file"
                        webkitdirectory=""
                        onChange={async () => {
                            const directoryPath =
                                await window.electronAPI.pathDirname(
                                    event.target.files[0].path,
                                );
                            runInAction(() => {
                                settings.managedGame = gameDetails.slug;
                                settings[`${gameDetails.slug}Path`] =
                                    directoryPath;
                            });
                        }}
                    />
                ))}

                <Dropdown>
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="p-0 font-bold text-inherit bg-transparent data-[hover=true]:bg-transparent"
                                endContent={icons.chevron}
                                radius="sm"
                                variant="light"
                            >
                                Mod Organizer - {currentGameDetails.name}
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
                        {supportedGames.map((gameDetails) => (
                            <DropdownItem
                                key={`navbar_game_${gameDetails.slug}`}
                                onClick={() => {
                                    const managedGamePathIsEmpty =
                                        typeof settings[
                                            gameDetails.slug + 'Path'
                                        ] === 'undefined' ||
                                        settings[gameDetails.slug + 'Path'] ===
                                            null ||
                                        String(
                                            settings[gameDetails.slug + 'Path'],
                                        ).length === 0;

                                    if (managedGamePathIsEmpty) {
                                        gameRefs.current[
                                            gameDetails.slug
                                        ].click();
                                    } else {
                                        runInAction(() => {
                                            settings.managedGame =
                                                gameDetails.slug;
                                        });
                                    }
                                }}
                            >
                                {gameDetails.name}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>

                <Dropdown>
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                endContent={icons.chevron}
                                radius="sm"
                                variant="light"
                            >
                                NEXUS MODS
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
                        >
                            Visit Mods
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <NavbarContent className="hidden sm:flex">
                    <NavbarItem>
                        <Button color="foreground">
                            <ArchiveBoxIcon className="h-5 w-5" />
                            Install Mod
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button color="foreground">
                            <ArrowPathIcon className="h-5 w-5 text-green-500" />
                            Refresh
                        </Button>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Button color="foreground">
                            <Cog6ToothIcon className="h-5 w-5" />
                            Settings
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </NavbarContent>

            <NavbarContent as="div" className="items-center" justify="end">
                <Button color="foreground">Mod Count: 64</Button>
                <Input
                    classNames={{
                        base: 'max-w-full sm:max-w-[20rem] h-10 mr-5',
                        mainWrapper: 'h-full',
                        input: 'text-small',
                        inputWrapper:
                            'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
                    }}
                    placeholder="Type to search..."
                    size="sm"
                    startContent={<Search size={18} />}
                    type="search"
                />
                <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name="Jason Hughes"
                    size="sm"
                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
            </NavbarContent>
        </Navbar>
    );
};

export default observer(Header);
