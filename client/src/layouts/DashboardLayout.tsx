import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar onMenuClick={() => setIsMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1240px] px-5 py-7 md:px-8">
                        <Suspense fallback={null}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}
