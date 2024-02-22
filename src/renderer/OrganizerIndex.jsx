import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';

import Header from './Header';
import settings from '../store/settings';

import TWW2BG from '../../assets/tww2-bg.jpg';
import TWW3BG from '../../assets/tww3-bg.jpg';
import Sidebar from './Sidebar';
import ModList from './ModList';

const OrganizerIndex = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (String(settings.managedGame).length === 0) {
            navigate('/');
        }
    }, [navigate]);

    if (String(settings.managedGame).length !== 0) {
        return (
            <>
                <main>
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0,
                            opacity: 0.2,
                            backgroundImage: `url(${settings.managedGame === 'tww3' ? TWW3BG : TWW2BG})`,
                            backgroundSize: 'cover',
                            zIndex: -1,
                        }}
                    />
                    <Header />
                    <div className="flex gap-4 mt-10">
                        <div className="w-8/12	">
                            <ModList />
                        </div>
                        <div className="w-4/12	">
                            <Sidebar />
                        </div>
                    </div>
                </main>
            </>
        );
    }
};

export default observer(OrganizerIndex);
