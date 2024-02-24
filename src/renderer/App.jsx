import { NextUIProvider, Card, CardBody } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { observer } from 'mobx-react';
import Startup from './Startup';
import settings from '../store/settings';

import Header from './Header';
import Sidebar from './Sidebar';
import ModList from './ModList';
import gameAssets from '../store/gameAssets';

import './App.css';

function App() {
    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <Toaster />
                {typeof settings.managedGame !== 'undefined' &&
                String(settings.managedGame).length !== 0 ? (
                    <main className="w-full h-full relative">
                        <div
                            className="absolute left-0 right-0 bottom-0 top-0 opacity-20 bg-cover z-0"
                            style={{
                                backgroundImage: `url(${gameAssets[settings.managedGame].bg})`,
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
                ) : (
                    <Startup />
                )}
            </NextThemesProvider>
        </NextUIProvider>
    );
}

export default observer(App);
