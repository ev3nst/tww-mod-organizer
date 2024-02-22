import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import { FolderOpenIcon, CloudArrowDownIcon } from '@heroicons/react/24/solid';
import SaveGames from './SaveGames';

function Sidebar() {
    return (
        <div className="flex w-full flex-col px-5">
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
                            Ut enim ad minim veniam, quis nostrud exercitation
                            ullamco laboris nisi ut aliquip ex ea commodo
                            consequat. Duis aute irure dolor in reprehenderit in
                            voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur.
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Sidebar;
