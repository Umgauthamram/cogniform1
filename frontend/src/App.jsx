import React, { useState, useEffect } from 'react';

import FillFormPage  from './components/Fillformpage'
import DashboardPage from './components/Dashboard'
import AnalysisPage from './components/Analysispage'
import CreateFormPage from './components/Createformpage'
import LandingPage from './components/Landingpage';
import LoginPage from './components/User/login';
import SignupPage from './components/User/Signup';


const AppLayout = ({ user, onLogout, page, setPage, selectedFormId, setSelectedFormId }) => {
    const renderPage = () => {
        switch (page) {
            case 'create':
                return <CreateFormPage setPage={setPage} />;
            case 'analysis':
                return <AnalysisPage formId={selectedFormId} setPage={setPage} />;
            case 'dashboard':
            default:
                return <DashboardPage setPage={setPage} setSelectedFormId={setSelectedFormId} />;
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Cogni<span className="text-indigo-600">Form</span>
                </h1>
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-700">Welcome, {user.name}</span>
                    <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Logout</button>
                </div>
            </header>
            <main>
                {renderPage()}
            </main>
        </div>
    );
};

const App = () => {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('landing');
    const [appPage, setAppPage] = useState('dashboard');
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('cogniform_user');
        const storedToken = localStorage.getItem('cogniform_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (data) => {
        setUser(data.user);
        localStorage.setItem('cogniform_user', JSON.stringify(data.user));
        localStorage.setItem('cogniform_token', data.token);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('cogniform_user');
        localStorage.removeItem('cogniform_token');
        setPage('landing');
    };

    const urlParams = new URLSearchParams(window.location.search);
    const formIdFromUrl = urlParams.get('formId');
    if (formIdFromUrl) {
        return (
             <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <FillFormPage formId={formIdFromUrl} />
            </div>
        );
    }
    
    if (loading) {
        return <div></div>; 
    }

    if (!user) {
        return (
            <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-4">
                {page === 'login' && <LoginPage setPage={setPage} onLogin={handleLogin} />}
                {page === 'signup' && <SignupPage setPage={setPage} onLogin={handleLogin} />}
                {page === 'landing' && <LandingPage setPage={setPage} />}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <AppLayout 
                user={user} 
                onLogout={handleLogout} 
                page={appPage} 
                setPage={setAppPage}
                selectedFormId={selectedFormId}
                setSelectedFormId={setSelectedFormId}
            />
        </div>
    );
}

export default App;