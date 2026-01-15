import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BarChart3, PlayCircle, Settings, LogOut } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const tiles = [
        {
            title: "Dashboard",
            description: "View key metrics and recent activities.",
            icon: LayoutDashboard,
            path: "/dashboard",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: "Job Board",
            description: "Manage job postings and applications.",
            icon: Briefcase,
            path: "/admin/jobs",
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            title: "Analytics",
            description: "Deep dive into recruitment performance.",
            icon: BarChart3,
            path: "/analytics",
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            title: "Go Through",
            description: "Quickly screening candidates.",
            icon: PlayCircle,
            path: "/go-through",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        }
    ];

    return (
        <div className="h-full p-8 flex flex-col animate-fade-in custom-scrollbar">
            <header className="mb-8 shrink-0 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-normal text-foreground tracking-tight mb-2">Welcome Home, {user?.email?.split('@')[0] || 'Admin'}</h1>
                    <p className="text-muted-foreground text-lg">Where would you like to start today?</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors"
                        title="Settings"
                    >
                        <Settings size={24} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {tiles.map((tile) => (
                    <div
                        key={tile.title}
                        onClick={() => navigate(tile.path)}
                        className="group relative overflow-hidden bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-white/10 rounded-[32px] p-8 cursor-pointer hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col items-center justify-center text-center"
                    >
                        <div className={`w-20 h-20 rounded-3xl ${tile.bg} ${tile.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <tile.icon size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium text-foreground mb-3">{tile.title}</h3>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs">
                            {tile.description}
                        </p>

                        {/* Hover Effect Decoration */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-current opacity-[0.03] rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none text-gray-500" />

                        {/* Arrow hint that appears on hover */}
                        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-gray-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
