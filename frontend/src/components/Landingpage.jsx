import React from 'react';

const LandingPage = ({ setPage }) => {
    return (
        <div className="text-center">
            <header className="mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800">
                    Welcome to Cogni<span className="text-indigo-600">Form</span>
                </h1>
                <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
                    Transform raw feedback into actionable insights. Create forms, gather responses, and let our AI do the heavy lifting.
                </p>
            </header>

            <div className="relative max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-indigo-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-200 rounded-full opacity-50"></div>
                
                <h2 className="text-3xl font-bold text-gray-700 mb-6 relative z-10">Get Started</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                    <button
                        onClick={() => setPage('login')}
                        className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setPage('signup')}
                        className="w-full sm:w-auto px-10 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;