import React from 'react';

const ScreenAILogo = ({ className = "w-8 h-8", color = "#1A73E8" }) => {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background shape - Soft rounded square container (optional, usually implied by placement) */}
            {/* Main Icon: Abstract Scanning / Filtering S */}

            {/* Top Bar - Representing a document or screen edge */}
            <path
                d="M10 12C10 10.8954 10.8954 10 12 10H28C29.1046 10 30 10.8954 30 12V14H10V12Z"
                fill={color}
                fillOpacity="0.9"
            />

            {/* Middle Section - The "Screening" lines with a checkmark implication */}
            <path
                d="M10 18H24"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />

            <path
                d="M10 26H20"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* The "AI/Check" Accent - A precise clear mark */}
            <circle cx="28" cy="24" r="5" fill={color} />
            <path
                d="M26 24L27.5 25.5L30.5 22.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Bottom scanning beam effect (Subtle) */}
            <path
                d="M12 32H28"
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default ScreenAILogo;
