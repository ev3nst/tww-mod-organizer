import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Spinner,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import settings from '../../store/settings';
import Games from './Games';

function Startup() {
    const managedGameIsEmpty =
        typeof settings.managedGame === 'undefined' ||
        String(settings.managedGame).length === 0;

    const showGameSelectorModal = managedGameIsEmpty;

    if (settings.loading === true) {
        return <Spinner size="lg" />;
    }

    return (
        <Modal size="5xl" isOpen={showGameSelectorModal} hideCloseButton>
            <ModalContent className="pb-4">
                <ModalHeader className="flex flex-col gap-5">
                    Choose which game to manage
                </ModalHeader>
                <ModalBody className="flex flex-row gap-5">
                    <Games />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default observer(Startup);
