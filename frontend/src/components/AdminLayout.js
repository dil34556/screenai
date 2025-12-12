import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // AUTH CHECK
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Jobs', href: '/admin/jobs', icon: '📢' },
        { name: 'Employees', href: '/admin/employees', icon: '👥' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 shadow-xl z-20 flex-shrink-0 hidden md:flex md:flex-col transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-wider">
                        Screen<span className="text-indigo-500">AI</span> <span className="text-slate-400 text-xs font-normal">Admin</span>
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3 text-xl opacity-80">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="pt-4 mt-4 border-t border-slate-800"></div>

                    {/* Secondary Actions */}
                    <Link to="/" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200">
                        <span className="mr-3 text-xl opacity-80">🏠</span>
                        Back to Home
                    </Link>

                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-sm font-medium rounded-lg text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors duration-200">
                        <span className="mr-3 text-xl opacity-80">🚪</span>
                        Logout
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            < div className="flex-1 overflow-auto" >
                <Outlet />
            </div >
        </div >
    );
};

export default AdminLayout;
