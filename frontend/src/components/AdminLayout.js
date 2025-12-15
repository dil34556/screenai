import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, LogOut, Home, BarChart3 } from 'lucide-react';



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
                // If simple string
                setUser({ email: storedUser });
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
        { name: 'Employees', href: '/admin/employees', icon: Users },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ];




    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-slate-900 text-white flex-shrink-0 hidden md:flex md:flex-col shadow-2xl relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Brand */}
                <div className="h-20 flex items-center px-8 border-b border-white/10 relative z-10">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
                        <span className="font-bold text-lg text-white">S</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Screen<span className="text-indigo-400">AI</span>
                    </h1>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1 relative z-10 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</div>
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon
                                    size={20}
                                    className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 relative z-10 bg-slate-900/50 backdrop-blur-sm">
                    {/* User Profile Snippet */}
                    {user && (
                        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">Recruiter</p>
                                <p className="text-xs text-slate-400 truncate">{user.email || 'User'}</p>
                            </div>
                        </div>
                    )}

                    <Link
                        to="/"
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors mb-2"
                    >
                        <Home size={20} className="mr-3 text-slate-500 group-hover:text-white" />
                        Back to Home
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                    >
                        <LogOut size={20} className="mr-3 opacity-80" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 relative">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
