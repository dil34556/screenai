import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, LogOut, BarChart3, ChevronRight, Plus, Sparkles, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Job Board', href: '/admin/jobs', icon: Briefcase },
        { name: 'Candidates', href: '/portal/employees', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-500 relative">

            {/* Ambient Background Glows - Adjusted for Theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* --- Floating Glass Sidebar --- */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-72 glass-panel m-4 rounded-[24px] flex flex-col shrink-0 z-30 hidden md:flex border border-border/50 shadow-2xl relative overflow-hidden bg-card/30"
            >
                {/* Logo Area */}
                <div className="h-24 flex items-center px-8">
                    <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow">
                            <Sparkles size={20} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <span className="text-xl font-heading font-light tracking-tight text-foreground block leading-none">
                                ScreenAI
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Recruiter</span>
                        </div>
                    </div>
                </div>

                {/* Primary Action */}
                <div className="px-6 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/jobs/create')}
                        className="w-full flex items-center justify-between bg-primary text-primary-foreground px-5 py-4 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Plus size={18} strokeWidth={3} />
                            Compose Job
                        </span>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] peer-hover:animate-shimmer" />
                    </motion.button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href) &&
                            (item.href !== '/dashboard' || location.pathname === '/dashboard');

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="block relative"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-full border border-primary/20 dark:border-white/5"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`relative z-10 flex items-center gap-4 px-4 py-3.5 rounded-full text-sm font-medium transition-colors duration-200 ${isActive ? 'text-primary dark:text-white' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`${isActive ? 'text-primary dark:text-[#8AB4F8]' : 'text-muted-foreground group-hover:text-foreground'}`}
                                    />
                                    <span>{item.name}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile (Bottom) */}
                <div className="p-4 mt-auto">
                    <div className="glass-panel-hover p-4 rounded-3xl flex items-center gap-3 cursor-pointer group border border-transparent hover:border-border/50" onClick={handleLogout}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-bold text-foreground">
                                {user?.email?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                            <p className="text-xs text-muted-foreground truncate">View Profile</p>
                        </div>
                        <LogOut size={18} className="text-muted-foreground group-hover:text-destructive transition-colors" />
                    </div>
                </div>
            </motion.aside>

            {/* --- Main Content Area (Glass Canvas) --- */}
            <main className="flex-1 h-full flex flex-col min-w-0 relative overflow-hidden p-4 pl-0">
                <div className="flex-1 rounded-[24px] bg-card/40 backdrop-blur-sm border border-border/50 flex flex-col relative overflow-hidden">
                    {/* Minimal Transparent Header */}
                    <header className="h-20 flex items-center px-8 shrink-0 justify-between z-20">
                        <div className="flex items-center gap-2 text-sm text-white/40">
                            <span className="hover:text-white transition-colors cursor-pointer">Portal</span>
                            <ChevronRight size={14} />
                            <span className="text-white/90 font-medium capitalize">
                                {location.pathname.split('/')[1] || 'Dashboard'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Removed ThemeToggle for now as we are enforcing Dark Mode for this specific aesthetic */}

                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
