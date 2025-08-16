import React from 'react';

const Loadinganimation = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 my-10">
            <div className="relative w-20 h-20">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-full h-full"
                        style={{ transform: `rotate(${i * 45}deg)` }}
                    >
                        <div
                            className="w-2 h-2 bg-indigo-500 rounded-full animate-samsung-pulse"
                            style={{ animationDelay: `${i * 0.12}s` }}
                        ></div>
                    </div>
                ))}
            </div>
            <p className="text-lg text-gray-600 font-medium">{text}</p>
            <style>{`
                @keyframes samsung-pulse {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-samsung-pulse {
                    animation: samsung-pulse 1.2s infinite ease-in-out both;
                }
            `}</style>
        </div>
    );
};

export default Loadinganimation;
