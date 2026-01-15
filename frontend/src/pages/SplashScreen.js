import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenAILogo from '../components/ScreenAILogo';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 animate-in fade-in duration-700">
            <div className="scale-150 mb-6 animate-bounce-subtle">
                <ScreenAILogo />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight animate-pulse">ScreenAI</h1>
        </div>
    );
};

export default SplashScreen;
