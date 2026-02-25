import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
    children?: ReactNode;
    seoTitle?: string;
    seoDescription?: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-gray-50">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
}
