import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { observer } from 'mobx-react';
import Startup from './Startup';
import OrganizerIndex from './OrganizerIndex';
import settings from '../store/settings';
import './App.css';

function App() {
    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <Toaster />
                {typeof settings.managedGame !== 'undefined' ? (
                    <OrganizerIndex />
                ) : (
                    <Startup />
                )}
            </NextThemesProvider>
        </NextUIProvider>
    );
}

export default observer(App);
