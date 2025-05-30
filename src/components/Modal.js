import React from 'react';

function Modal({ isOpen, onClose, title, children, size = "md" }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl"
    };

    // Prevent clicks inside the modal from closing it, only background clicks (if implemented) or close button.
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
            // onClick={onClose} // Optional: Close modal on backdrop click
        >
            <div 
                className={`bg-white p-6 rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalEnter`}
                onClick={handleModalContentClick} // Prevent event bubbling to the backdrop
            >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-3xl p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div>{children}</div>
            </div>
            {/* Keyframes for modal entry animation */}
            <style jsx global>{`
                @keyframes modalEnter {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-modalEnter {
                    animation: modalEnter 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
}

export default Modal;