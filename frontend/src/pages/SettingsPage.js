import React, { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Monitor, Bell, Shield, LogOut, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { updateEmployeePassword } from '../services/api';
import ViewEmployees from '../components/ViewEmployees';

const SettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [user, setUser] = useState(null);

    // Password State
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.new.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        try {
            if (!user || !user.id) throw new Error("User ID not found");
            await updateEmployeePassword(user.id, passwords.new);
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setPasswords({ new: '', confirm: '' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const tabs = [
        { id: 'general', label: 'General', icon: User },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Sun },
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-transparent text-foreground font-sans selection:bg-primary/30 selection:text-primary pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your account preferences and configurations.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass-panel p-8 rounded-3xl border border-border/10 bg-card/40">
                                <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                                        {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{user?.email?.split('@')[0] || 'User'}</h3>
                                        <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                                            <Shield size={10} /> Admin
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-6 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-3 text-muted-foreground text-sm cursor-not-allowed"
                                        />
                                        <p className="text-xs text-muted-foreground/60 mt-2">Email address cannot be changed by the user.</p>
                                    </div>
                                    <div className="pt-4 border-t border-border/10">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                                        >
                                            <LogOut size={16} /> Sign out of account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Settings */}
                    {activeTab === 'team' && (
                        <div className="space-y-6 animate-fade-in">
                            <ViewEmployees readOnly={true} />
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass-panel p-8 rounded-3xl border border-border/10 bg-card/40">
                                <h2 className="text-xl font-bold text-foreground mb-6">Password & Security</h2>

                                <form onSubmit={handlePasswordChange} className="max-w-lg space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                placeholder="Enter new password"
                                                className="w-full bg-input/20 border border-border/30 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                placeholder="Confirm new password"
                                                className="w-full bg-input/20 border border-border/30 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {message.text && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass-panel p-8 rounded-3xl border border-border/10 bg-card/40">
                                <h2 className="text-xl font-bold text-foreground mb-2">Interface Theme</h2>
                                <p className="text-muted-foreground text-sm mb-8">Customize how ScreenAI looks on your device.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`relative group p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'}`}
                                    >
                                        <div className="bg-[#f8fafc] w-full h-24 rounded-lg mb-4 shadow-sm border border-slate-200 flex items-center justify-center">
                                            <div className="w-16 h-8 bg-white rounded shadow-sm"></div>
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                                            <Sun size={16} /> Light
                                        </div>
                                        {theme === 'light' && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                                    </button>

                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`relative group p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'}`}
                                    >
                                        <div className="bg-[#0f172a] w-full h-24 rounded-lg mb-4 shadow-sm border border-slate-800 flex items-center justify-center">
                                            <div className="w-16 h-8 bg-[#1e293b] rounded shadow-sm border border-slate-700"></div>
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                                            <Moon size={16} /> Dark
                                        </div>
                                        {theme === 'dark' && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                                    </button>

                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`relative group p-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'}`}
                                    >
                                        <div className="bg-gradient-to-br from-[#f8fafc] to-[#0f172a] w-full h-24 rounded-lg mb-4 shadow-sm border border-border/50 flex items-center justify-center opacity-80">
                                            <Monitor size={24} className="text-gray-500" />
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                                            <Monitor size={16} /> System
                                        </div>
                                        {theme === 'system' && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
