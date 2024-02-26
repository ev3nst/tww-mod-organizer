import { useState } from 'react';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react';
import { observer } from 'mobx-react';
import {
    ChevronDownIcon,
    PlusCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import modFiles from '../../store/modFiles';
import ModConflictInitiator from './ModConflictInitiator';

const ModProfiles = () => {
    const [createNewProfile, setCreateNewProfile] = useState({
        isModalOpen: false,
        profileName: '',
    });

    const [deleteProfileModal, setDeleteProfileModal] = useState(false);

    return (
        <div className="flex items-center px-5 w-full">
            <p className="mr-3">Profile:</p>
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        disableRipple
                        className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                        endContent={<ChevronDownIcon width={15} height={15} />}
                        radius="sm"
                        variant="light"
                    >
                        {modFiles.modProfile}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu>
                    {modFiles.availableModProfiles.map((aop) => (
                        <DropdownItem
                            key={`available_order_profile_${aop}`}
                            onClick={() => {
                                modFiles.changeModProfile(
                                    aop.replace('.txt', ''),
                                );
                            }}
                        >
                            {aop.replace('.txt', '')}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
            <Button
                size="sm"
                className="ml-5"
                color="secondary"
                endContent={
                    <PlusCircleIcon color="white" width={20} height={20} />
                }
                onClick={() => {
                    setCreateNewProfile({
                        isModalOpen: true,
                        profileName: '',
                    });
                }}
            >
                CREATE
            </Button>

            <Modal isOpen={createNewProfile.isModalOpen} hideCloseButton>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Create Mod Order Profile
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                            label="Name"
                            placeholder="Provide name for the profile"
                            required
                            variant="bordered"
                            onChange={(event) => {
                                setCreateNewProfile({
                                    isModalOpen: true,
                                    profileName: event.target.value,
                                });
                            }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onPress={() => {
                                if (createNewProfile.profileName.length > 0) {
                                    if (
                                        modFiles.availableModProfiles.includes(
                                            createNewProfile.profileName,
                                        )
                                    ) {
                                        toast.error(
                                            'There is already a profile with given name.',
                                        );
                                        return;
                                    }

                                    modFiles.createModProfile(
                                        createNewProfile.profileName,
                                    );
                                    setCreateNewProfile({
                                        isModalOpen: false,
                                        profileName: '',
                                    });
                                }
                            }}
                        >
                            Create
                        </Button>
                        <Button
                            onPress={() => {
                                setCreateNewProfile({
                                    isModalOpen: false,
                                    profileName: '',
                                });
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Button
                size="sm"
                className="ml-5"
                color="danger"
                endContent={<TrashIcon width={20} height={20} />}
                onClick={() => {
                    if (modFiles.modProfile !== 'default') {
                        setDeleteProfileModal(true);
                    } else {
                        toast.error('Default profile cannot be deleted.');
                    }
                }}
            >
                DELETE
            </Button>

            <Modal isOpen={deleteProfileModal} hideCloseButton>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Delete Mod Profile
                    </ModalHeader>
                    <ModalBody>
                        <p>
                            Are you sure delete <b>{modFiles.modProfile}</b> ?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            onPress={async () => {
                                await window.electronAPI.deleteModProfile(
                                    modFiles.modProfile,
                                );
                                modFiles.changeModProfile('default');
                                setDeleteProfileModal(false);
                            }}
                        >
                            Delete
                        </Button>
                        <Button
                            onPress={() => {
                                setDeleteProfileModal(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <ModConflictInitiator />
        </div>
    );
};

export default observer(ModProfiles);
