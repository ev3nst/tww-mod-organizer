import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { observer } from 'mobx-react';
import Startup from './Startup';
import OrganizerIndex from './OrganizerIndex';
import './App.css';

function App() {
    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <Router>
                    <Routes>
                        <Route index path="/" element={<Startup />} />
                        <Route path="/organizer" element={<OrganizerIndex />} />
                    </Routes>
                </Router>
            </NextThemesProvider>
        </NextUIProvider>
    );
}

export default observer(App);
