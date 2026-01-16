import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import ScreenAILogo from '../components/ScreenAILogo';
import SplashScreen from './SplashScreen';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await login({ email, password });
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            setShowSplash(true);
            setTimeout(() => {
                navigate('/home');
            }, 1000); // 1 second splash screen
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] font-sans text-[#202124]">
            <div className="w-full max-w-[450px] p-6">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    {/* ScreenAI Logo - Simple & Clean */}
                    <div className="flex items-center gap-2 mb-4">
                        <ScreenAILogo className="w-10 h-10" />
                        <span className="text-2xl font-normal text-[#202124] tracking-tight">ScreenAI</span>
                    </div>
                    <h1 className="text-2xl font-normal text-[#202124] text-center mb-2">
                        Sign in
                    </h1>
                    <p className="text-base text-[#202124] text-center">
                        Use your ScreenAI Account
                    </p>
                </div>

                {/* Material Card */}
                <div className="bg-white rounded-lg border border-[#DADCE0] p-10 space-y-8 shadow-sm">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="flex items-center gap-2 text-[#d93025] text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Email Input - Material Outlined Style */}
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    className="peer w-full h-14 px-3 rounded text-base text-[#202124] border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] outline-none transition-colors bg-transparent z-10 relative placeholder-transparent"
                                    id="email"
                                    placeholder="Email or phone"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-3 top-0 px-1 bg-white text-[#5f6368] text-xs -translate-y-1/2 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#5f6368] peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1A73E8] peer-focus:bg-white z-20 cursor-text mx-1"
                                >
                                    Email or phone
                                </label>
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    className="peer w-full h-14 px-3 rounded text-base text-[#202124] border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] outline-none transition-colors bg-transparent z-10 relative placeholder-transparent"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 top-0 px-1 bg-white text-[#5f6368] text-xs -translate-y-1/2 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#5f6368] peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1A73E8] peer-focus:bg-white z-20 cursor-text mx-1"
                                >
                                    Enter your password
                                </label>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-start">
                            <a href="#" className="text-sm font-medium text-[#1A73E8] hover:bg-[#F6FAFE] px-1 py-0.5 rounded transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <div className="text-sm text-[#5f6368] mt-8 mb-8">
                            Not your computer? Use Guest mode to sign in privately. <a href="#" className="font-medium text-[#1A73E8] hover:underline">Learn more</a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-10">
                            <Link to="/register" className="text-sm font-medium text-[#1A73E8] hover:bg-[#F6FAFE] px-4 py-2 rounded transition-colors">
                                Create account
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1A73E8] text-white px-6 py-2 rounded font-medium text-sm hover:bg-[#1557d0] hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Next...' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-between mt-6 px-4">
                    <div className="flex items-center gap-4 text-xs text-[#5f6368]">
                        <select className="bg-transparent border-none outline-none cursor-pointer hover:bg-[#F1F3F4] rounded p-1">
                            <option>English (United States)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[#5f6368]">
                        <a href="#" className="hover:text-[#202124]">Help</a>
                        <a href="#" className="hover:text-[#202124]">Privacy</a>
                        <a href="#" className="hover:text-[#202124]">Terms</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
