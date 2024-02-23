import { observer } from 'mobx-react';
import { Card, CardBody } from '@nextui-org/react';

import Header from './Header';
import settings from '../store/settings';

import TWW2BG from '../../assets/tww2-bg.jpg';
import TWW3BG from '../../assets/tww3-bg.jpg';
import Sidebar from './Sidebar';
import ModList from './ModList';

const OrganizerIndex = () => {
    if (String(settings.managedGame).length !== 0) {
        return (
            <>
                <main className="w-full h-full relative">
                    <div
                        className="absolute left-0 right-0 bottom-0 top-0 opacity-20 bg-cover z-0"
                        style={{
                            backgroundImage: `url(${settings.managedGame === 'tww3' ? TWW3BG : TWW2BG})`,
                        }}
                    />
                    <Header />
                    <div className="fixed top-[100px] left-0 right-0 bottom-0 flex gap-4 px-10 mb-10">
                        <Card className="w-8/12 bg-zinc-950/90 mr-5">
                            <CardBody>
                                <ModList />
                            </CardBody>
                        </Card>

                        <div className="w-4/12 flex flex-col justify-between">
                            <Sidebar />
                        </div>
                    </div>
                </main>
            </>
        );
    }
};

export default observer(OrganizerIndex);
