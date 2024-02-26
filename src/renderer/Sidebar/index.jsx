import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { FolderOpenIcon, CloudArrowDownIcon } from '@heroicons/react/24/solid';
import SaveGames from './SaveGames';
import Downloads from './Downloads';

function Sidebar() {
    return (
        <div className="flex flex-col justify-between h-full">
            <div
                className="overflow-auto"
                style={{
                    maxHeight: 'calc(100% - 100px)',
                }}
            >
                <Tabs aria-label="Options" variant="bordered" fullWidth>
                    <Tab
                        key="saves"
                        title={
                            <div className="flex items-center space-x-2">
                                <FolderOpenIcon className="h-5 w-5" />
                                <span>SAVES</span>
                            </div>
                        }
                    >
                        <Card className="bg-zinc-950/90">
                            <CardBody>
                                <SaveGames />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab
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
                                <Downloads />
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
        </div>
    );
}

export default Sidebar;
