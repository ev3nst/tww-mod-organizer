import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { FolderOpenIcon, CloudArrowDownIcon } from '@heroicons/react/24/solid';
import SaveGames from './SaveGames';

function Sidebar() {
    return (
        <>
            <div className="flex flex-col flex-grow">
                <Tabs aria-label="Options" variant="bordered" fullWidth c>
                    <Tab
                        className="flex-grow"
                        key="saves"
                        title={
                            <div className="flex items-center space-x-2">
                                <FolderOpenIcon className="h-5 w-5" />
                                <span>SAVES</span>
                            </div>
                        }
                    >
                        <Card className="bg-zinc-950/90 h-full">
                            <CardBody className="h-full">
                                <SaveGames />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab
                        className="flex-grow"
                        key="downloads"
                        title={
                            <div className="flex items-center space-x-2">
                                <CloudArrowDownIcon className="h-5 w-5 text-blue-500" />
                                <span>DOWNLOADS</span>
                            </div>
                        }
                    >
                        <Card>
                            <CardBody>
                                Ut enim ad minim veniam, quis nostrud
                                exercitation ullamco laboris nisi ut aliquip ex
                                ea commodo consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum
                                dolore eu fugiat nulla pariatur.
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>

            <Button
                className="h-20	text-2xl ml-1 mt-5"
                size="lg"
                color="primary"
                variant="shadow"
            >
                LAUNCH
            </Button>
        </>
    );
}

export default Sidebar;
