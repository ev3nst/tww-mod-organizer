import { useRef } from 'react';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
    NavbarItem,
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    Button,
} from '@nextui-org/react';
import toast from 'react-hot-toast';
import { ChevronDown } from '../Icons';
import supportedGames from '../../store/supportedGames.js';
import settings from '../../store/settings';
import dbKeys from '../../main/db/keys';
import modFiles from '../../store/modFiles';
import saveGameFiles from '../../store/saveGameFiles';
import downloadedFiles from '../../store/downloadedFiles';

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
                    onChange={async (event) => {
                        const directoryPath =
                            await window.electronAPI.pathDirname(
                                event.target.files[0].path,
                            );

                        const isCorrectPath = await window.electronAPI.fsExists(
                            `${directoryPath}\\${gameDetails.exeName}.exe`,
                        );

                        if (!isCorrectPath) {
                            toast.error(
                                'This is not a valid installation folder for chosen game.',
                                {
                                    position: 'top-center',
                                },
                            );

                            return;
                        }

                        await window.electronAPI.dbSet(
                            dbKeys.MOD_PROFILE,
                            'default',
                        );
                        await window.electronAPI.dbSet(
                            dbKeys.MANAGED_GAME,
                            gameDetails.slug,
                        );

                        await modFiles.getFiles();
                        await modFiles.getModProfile();
                        await saveGameFiles.getFiles();
                        await downloadedFiles.getFiles();

                        const toJSGameInstallPaths = toJS(
                            settings.gameInstallPaths,
                        );

                        let newGameInstallPaths = {};
                        if (typeof toJSGameInstallPaths !== 'undefined') {
                            newGameInstallPaths = {
                                ...toJSGameInstallPaths,
                            };
                        }

                        newGameInstallPaths[gameDetails.slug] = directoryPath;
                        runInAction(() => {
                            settings.managedGame = gameDetails.slug;
                            settings.gameInstallPaths = newGameInstallPaths;
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
                    className="w-[340px]"
                    itemClasses={{
                        base: 'gap-4',
                    }}
                >
                    {supportedGames.map((gameDetails) => (
                        <DropdownItem
                            key={`navbar_game_${gameDetails.slug}`}
                            onClick={async () => {
                                const managedGamePathIsEmpty =
                                    typeof settings.gameInstallPaths[
                                        gameDetails.slug
                                    ] === 'undefined' ||
                                    settings.gameInstallPaths[
                                        gameDetails.slug
                                    ] === null ||
                                    String(
                                        settings.gameInstallPaths[
                                            gameDetails.slug
                                        ],
                                    ).length === 0;

                                if (managedGamePathIsEmpty) {
                                    gameRefs.current[gameDetails.slug].click();
                                } else {
                                    await window.electronAPI.dbSet(
                                        dbKeys.MOD_PROFILE,
                                        'default',
                                    );
                                    await window.electronAPI.dbSet(
                                        dbKeys.MANAGED_GAME,
                                        gameDetails.slug,
                                    );

                                    await modFiles.getFiles();
                                    await modFiles.getModProfile();
                                    await saveGameFiles.getFiles();
                                    await downloadedFiles.getFiles();

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
