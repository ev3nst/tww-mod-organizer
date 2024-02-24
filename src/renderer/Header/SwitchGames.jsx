import { useRef } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import {
    NavbarItem,
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    Button,
} from '@nextui-org/react';
import settings from '../../store/settings';
import supportedGames from '../../store/supportedGames.js';
import { ChevronDown } from '../Icons';

const SwitchGames = () => {
    const gameRefs = useRef({});
    const currentGameDetails = supportedGames.find((obj) => {
        return obj.slug === settings.managedGame;
    });

    return (
        <>
            {supportedGames.map((gameDetails) => (
                <input
                    key={`navbar_game_input_${gameDetails.slug}`}
                    className="hidden"
                    ref={(ref) => (gameRefs.current[gameDetails.slug] = ref)}
                    type="file"
                    webkitdirectory=""
                    onChange={async () => {
                        const directoryPath =
                            await window.electronAPI.pathDirname(
                                event.target.files[0].path,
                            );
                        runInAction(() => {
                            settings.managedGame = gameDetails.slug;
                            settings[`${gameDetails.slug}Path`] = directoryPath;
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
                            endContent={
                                <ChevronDown fill="currentColor" size={15} />
                            }
                            radius="sm"
                            variant="light"
                        >
                            {currentGameDetails.name}
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
                                    String(settings[gameDetails.slug + 'Path'])
                                        .length === 0;

                                if (managedGamePathIsEmpty) {
                                    gameRefs.current[gameDetails.slug].click();
                                } else {
                                    runInAction(() => {
                                        settings.managedGame = gameDetails.slug;
                                    });
                                }
                            }}
                        >
                            {gameDetails.name}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </>
    );
};

export default observer(SwitchGames);
