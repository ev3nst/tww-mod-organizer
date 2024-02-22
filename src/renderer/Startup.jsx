import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
    CardFooter,
    Image,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import settings from '../store/settings';

import './App.css';
import { supportedGames } from '../store/constants';
import gameAssets from '../store/gameAssets';

function Startup() {
    const managedGameIsEmpty =
        typeof settings.managedGame === 'undefined' ||
        String(settings.managedGame).length === 0;

    let managedGamePathIsEmpty = true;
    if (managedGameIsEmpty === false) {
        managedGamePathIsEmpty =
            typeof settings[settings.managedGame + 'Path'] === 'undefined' ||
            settings[settings.managedGame + 'Path'] === null ||
            String(settings[settings.managedGame + 'Path']).length === 0;
    }

    const showGameSelectorModal = managedGameIsEmpty || managedGamePathIsEmpty;
    const navigate = useNavigate();
    const gameRefs = useRef({});

    useEffect(() => {
        if (!showGameSelectorModal) {
            navigate('/organizer');
        }
    }, [navigate, showGameSelectorModal]);

    return (
        <Modal size="5xl" isOpen={showGameSelectorModal}>
            <ModalContent className="pb-4">
                <ModalHeader className="flex flex-col gap-5">
                    Choose which game to manage
                </ModalHeader>
                <ModalBody className="flex flex-row gap-5">
                    {supportedGames.map((gameDetails) => (
                        <Card
                            key={`startup_choose_game_${gameDetails.slug}`}
                            className="grow"
                            shadow="sm"
                            isPressable
                            onPress={() => {
                                gameRefs.current[gameDetails.slug].click();
                            }}
                        >
                            <CardBody className="overflow-visible p-0">
                                <Image
                                    shadow="sm"
                                    radius="lg"
                                    width="100%"
                                    alt={gameDetails.name}
                                    className="w-full object-cover h-[350px]"
                                    src={gameAssets[gameDetails.slug].logo}
                                />
                            </CardBody>
                            <CardFooter className="justify-center py-4">
                                <b className="text-lg">{gameDetails.name}</b>
                            </CardFooter>
                            <input
                                className="hidden"
                                ref={(ref) =>
                                    (gameRefs.current[gameDetails.slug] = ref)
                                }
                                type="file"
                                webkitdirectory=""
                                onChange={() => {
                                    const directoryPath =
                                        window.electronAPI.pathDirname(
                                            event.target.files[0].path,
                                        );
                                    runInAction(() => {
                                        settings.managedGame = gameDetails.slug;
                                        settings[`${gameDetails.slug}Path`] =
                                            directoryPath;
                                    });
                                }}
                            />
                        </Card>
                    ))}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default observer(Startup);
