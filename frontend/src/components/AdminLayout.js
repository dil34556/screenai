import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    LogOut,
    BarChart3,
    ChevronRight,
    Plus,
    Settings,
    PlayCircle,
    PanelLeftClose,
    PanelLeftOpen,
    Home
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import ScreenAILogo from './ScreenAILogo';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // AUTH CHECK
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                setUser({ email: storedUser });
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navigation = [
        { name: 'Home', href: '/home', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Job Board', href: '/admin/jobs', icon: Briefcase },
        { name: 'Analytics', href: '/admin/analysis', icon: BarChart3 },
        { name: 'Go Through', href: '/go-through', icon: PlayCircle },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isHome = location.pathname === '/home';

    return (
        <LayoutGroup>
            <motion.div
                layout
                className="flex h-screen bg-[#FDFDF5] dark:bg-[#0b0f19] text-foreground font-sans overflow-hidden relative"
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >

                {/* --- Navigation Drawer --- */}
                <AnimatePresence>
                    {!isHome && (
                        <motion.aside
                            layout
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: isCollapsed ? 80 : 288, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className={`
                                flex shrink-0 z-30 bg-[#F8F9FA] dark:bg-[#111418]
                                flex-col h-full border-r border-gray-200 dark:border-white/10 hidden md:flex
                            `}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            {/* Logo Area */}
                            <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 justify-between'} mb-2 shrink-0`}>
                                {!isCollapsed && (
                                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                                        <div className="flex items-center justify-center shrink-0">
                                            <ScreenAILogo className="w-8 h-8" />
                                        </div>
                                        <span className="text-xl font-normal text-[#1F1F1F] dark:text-gray-100 tracking-tight transition-opacity duration-200">
                                            ScreenAI
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors ${isCollapsed ? '' : ''}`}
                                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                                </button>
                            </div>

                            {/* Primary Action */}
                            <div className="px-4 mb-6 flex justify-center shrink-0">
                                <button
                                    onClick={() => navigate('/admin/jobs/create')}
                                    className={`h-[56px] flex items-center bg-[#C2E7FF] dark:bg-[#004a77] text-[#001D35] dark:text-[#c2e7ff] hover:shadow-md transition-all rounded-[16px] font-medium text-sm
                                        ${isCollapsed ? 'w-[56px] justify-center px-0' : 'w-full gap-4 px-6'}
                                    `}
                                    title="Compose Job"
                                >
                                    <Plus size={24} />
                                    {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Compose Job</span>}
                                </button>
                            </div>

                            {/* Navigation Items */}
                            <nav className="flex-1 overflow-y-auto scrollbar-hide flex flex-col px-3 gap-1 py-2">
                                {navigation.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href) &&
                                        (item.href !== '/dashboard' || location.pathname === '/dashboard');

                                    // Skip Home link in Sidebar for consistency since we have a specific Home page
                                    if (item.name === 'Home') return null;

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`
                                                flex items-center transition-colors rounded-full font-medium relative
                                                ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'} py-3 text-sm mb-1 
                                                ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}
                                            `}
                                            title={isCollapsed ? item.name : ''}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                            <item.icon
                                                size={24}
                                                className={`relative z-10 ${isActive ? "fill-current" : ""}`}
                                                strokeWidth={isActive ? 2 : 2}
                                            />
                                            {!isCollapsed && (
                                                <span className="relative z-10 whitespace-nowrap overflow-hidden">
                                                    {item.name}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* User Profile */}
                            <div className="p-4 mt-auto shrink-0">
                                <div
                                    className={`hover:bg-black/5 dark:hover:bg-white/5 p-3 rounded-full flex items-center gap-3 cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                                    onClick={handleLogout}
                                    title="Logout"
                                >
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 flex items-center justify-center text-sm font-bold">
                                        {user?.email?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    {!isCollapsed && (
                                        <>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <p className="text-sm font-medium text-[#1F1F1F] dark:text-gray-200 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">View Profile</p>
                                            </div>
                                            <LogOut size={20} className="text-gray-500 dark:text-gray-500 shrink-0" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* --- Main Content Area --- */}
                <motion.main
                    layout
                    className={`flex-1 flex flex-col min-w-0 relative overflow-hidden p-0 bg-[#FDFDF5] dark:bg-[#0b0f19] ${isHome ? 'order-1' : ''}`}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <div className="flex-1 rounded-none bg-transparent flex flex-col relative overflow-hidden">
                        {/* Minimal Transparent Header - Hide on Home */}
                        {!isHome && (
                            <header className="h-16 flex items-center px-6 shrink-0 justify-between z-20 border-b border-gray-200/50 dark:border-white/10 bg-[#FDFDF5] dark:bg-[#0b0f19]">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span
                                        onClick={() => navigate('/home')}
                                        className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
                                    >
                                        Portal
                                    </span>
                                    <ChevronRight size={14} />
                                    <span className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                                        {location.pathname.split('/')[1] || 'Dashboard'}
                                    </span>
                                </div>
                            </header>
                        )}

                        <div className="flex-1 flex flex-col overflow-y-auto relative bg-[#FDFDF5] dark:bg-[#0b0f19] scroll-smooth">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1"
                                >
                                    <Outlet />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.main>
            </motion.div>
        </LayoutGroup>
    );
};

export default AdminLayout;
