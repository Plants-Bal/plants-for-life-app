import React, { useState, useEffect } from 'react';

// SVG Icon Components (could also be imported from a separate Icons.js file)
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


function CustomAlert({ message, type = 'info', onClose, duration = 3000 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose(); // Call the onClose callback if provided when alert hides
                }
            }, duration);
            return () => clearTimeout(timer); // Cleanup timer on unmount or if message/duration changes
        } else {
            setIsVisible(false); // Ensure alert is hidden if message becomes null or empty
        }
    }, [message, type, duration, onClose]); // Added 'type' to dependencies in case styling relies on it during visibility

    if (!isVisible) {
        return null;
    }

    const typeClasses = {
        info: { 
            bg: 'bg-blue-50', 
            border: 'border-blue-400', 
            text: 'text-blue-700', 
            icon: <InfoIcon /> 
        },
        success: { 
            bg: 'bg-green-50', 
            border: 'border-green-400', 
            text: 'text-green-700', 
            icon: <CheckCircleIcon /> 
        },
        warning: { 
            bg: 'bg-yellow-50', 
            border: 'border-yellow-400', 
            text: 'text-yellow-700', 
            icon: <WarningIcon /> 
        },
        error: { 
            bg: 'bg-red-50', 
            border: 'border-red-400', 
            text: 'text-red-700', 
            icon: <ErrorIcon /> 
        },
    };

    const currentType = typeClasses[type] || typeClasses.info; // Default to 'info' style
    
    const handleDismiss = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <div 
            className={`fixed top-5 right-5 p-4 border-l-4 rounded-md shadow-lg z-[1000] ${currentType.bg} ${currentType.border} ${currentType.text} transition-all duration-300 ease-in-out animate-alertEnter`} 
            role="alert"
        >
            <div className="flex items-center">
                <div className="py-1 mr-3 shrink-0">{currentType.icon}</div>
                <div className="flex-grow"> 
                    <p className="font-semibold">{message}</p> 
                </div>
                <button 
                    onClick={handleDismiss} 
                    className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 inline-flex h-8 w-8 ${currentType.bg} hover:bg-opacity-80 focus:ring-offset-1 ${currentType.text} focus:ring-${type}-400`} // Adjusted focus ring color based on type
                    aria-label="Dismiss"
                > 
                    <span className="sr-only">Dismiss</span>
                    &times; 
                </button>
            </div>
            {/* Keyframes for alert entry animation */}
            <style jsx global>{`
                @keyframes alertEnter {
                    from { 
                        opacity: 0; 
                        transform: translateX(100%); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
                .animate-alertEnter {
                    animation: alertEnter 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default CustomAlert;