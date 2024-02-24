import { useRef } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
    CardFooter,
    Image,
    Tooltip,
} from '@nextui-org/react';
import toast from 'react-hot-toast';
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';
import settings from '../../store/settings';

import supportedGames from '../../store/supportedGames';
import gameAssets from '../../store/gameAssets';

function Startup() {
    const managedGameIsEmpty =
        typeof settings.managedGame === 'undefined' ||
        String(settings.managedGame).length === 0;

    const showGameSelectorModal = managedGameIsEmpty;
    const gameRefs = useRef({});

    const renderSupportedGames = () => {
        return supportedGames.map((gameDetails) => {
            const gamePathExists =
                typeof settings.gameInstallPaths !== 'undefined' &&
                typeof settings.gameInstallPaths[gameDetails.slug] !==
                    'undefined' &&
                String(settings.gameInstallPaths[gameDetails.slug]).length > 0;

            return (
                <Card
                    key={`startup_choose_game_${gameDetails.slug}`}
                    className="grow"
                    shadow="sm"
                    isPressable
                    onPress={async () => {
                        if (gamePathExists === true) {
                            runInAction(() => {
                                settings.managedGame = gameDetails.slug;
                            });
                        } else {
                            gameRefs.current[gameDetails.slug].click();
                        }
                    }}
                >
                    <CardBody className="overflow-visible p-0">
                        {gamePathExists === true ? (
                            <Image
                                shadow="sm"
                                radius="lg"
                                width="100%"
                                alt={gameDetails.name}
                                className="w-full object-cover h-[350px]"
                                src={gameAssets[gameDetails.slug].logo}
                                style={{
                                    filter: gamePathExists
                                        ? ''
                                        : 'grayscale(100%)',
                                }}
                            />
                        ) : (
                            <>
                                <Tooltip
                                    color="danger"
                                    content="We could not identify the installation path, you can click on this image to choose manually."
                                >
                                    <Image
                                        shadow="sm"
                                        radius="lg"
                                        width="100%"
                                        alt={gameDetails.name}
                                        className="w-full object-cover h-[350px]"
                                        src={gameAssets[gameDetails.slug].logo}
                                        style={{
                                            filter: gamePathExists
                                                ? ''
                                                : 'grayscale(100%)',
                                        }}
                                    />
                                </Tooltip>
                                <input
                                    className="hidden"
                                    ref={(ref) =>
                                        (gameRefs.current[gameDetails.slug] =
                                            ref)
                                    }
                                    type="file"
                                    webkitdirectory=""
                                    onChange={async (event) => {
                                        const directoryPath =
                                            await window.electronAPI.pathDirname(
                                                event.target.files[0].path,
                                            );
                                        const isCorrectPath =
                                            await window.electronAPI.fsExists(
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

                                        runInAction(() => {
                                            let newGameInstallPaths = {};
                                            settings.managedGame =
                                                gameDetails.slug;
                                            const toJSGameInstallPaths = toJS(
                                                settings.gameInstallPaths,
                                            );

                                            if (
                                                typeof toJSGameInstallPaths !==
                                                'undefined'
                                            ) {
                                                newGameInstallPaths = {
                                                    ...toJSGameInstallPaths,
                                                };
                                            }

                                            newGameInstallPaths[
                                                gameDetails.slug
                                            ] = directoryPath;
                                            settings.gameInstallPaths =
                                                newGameInstallPaths;
                                        });
                                    }}
                                />
                            </>
                        )}
                    </CardBody>
                    <CardFooter className="justify-center py-4">
                        <b className="text-lg">{gameDetails.name}</b>
                    </CardFooter>
                </Card>
            );
        });
    };

    return (
        <Modal size="5xl" isOpen={showGameSelectorModal} hideCloseButton>
            <ModalContent className="pb-4">
                <ModalHeader className="flex flex-col gap-5">
                    Choose which game to manage
                </ModalHeader>
                <ModalBody className="flex flex-row gap-5">
                    {renderSupportedGames()}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default observer(Startup);
