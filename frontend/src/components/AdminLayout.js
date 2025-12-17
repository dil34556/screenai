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
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase }, // Pointing to admin jobs
        { name: 'Employees', href: '/portal/employees', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
                        <span className="text-xl font-bold">ScreenAI</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</div>
                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">R</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Recruiter</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@demo.com'}</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <Home size={16} />
                            Back to Home
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
