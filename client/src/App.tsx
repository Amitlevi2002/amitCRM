import '@fontsource-variable/inter-tight';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';

// Overview ships with the first load; the heavier pages (dnd-kit, react-table, forms) load on demand.
const Pipeline = lazy(() => import('./pages/Pipeline'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Activities = lazy(() => import('./pages/Activities'));

const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="pipeline" element={<Pipeline />} />
                        <Route path="contacts" element={<Contacts />} />
                        <Route path="activities" element={<Activities />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
                <Toaster />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
