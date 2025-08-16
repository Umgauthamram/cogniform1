import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loadinganimation from '../ui/Loadinganimation';


const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('cogniform_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconClipboard = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 7a1 1 0 000 2h14a1 1 0 100-2H3zM3 3a1 1 0 000 2h14a1 1 0 100-2H3z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

const DeleteConfirmationModal = ({ onConfirm, onCancel, formTitle }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete the form "<strong>{formTitle}</strong>"? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Delete</button>
            </div>
        </div>
    </div>
);

const DashboardPage = ({ setPage, setSelectedFormId }) => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState({});
    const [formToDelete, setFormToDelete] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/forms`, getAuthHeaders());
                setForms(response.data);
            } catch (error) {
                console.error("Failed to fetch forms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
    }, []);

    const handleAnalyzeClick = (formId) => {
        setSelectedFormId(formId);
        setPage('analysis');
    };

    const handleCopyClick = (formId) => {
        const url = `${window.location.origin}/?formId=${formId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(prev => ({ ...prev, [formId]: true }));
            setTimeout(() => setCopied(prev => ({ ...prev, [formId]: false })), 2000);
        });
    };

    const handleDeleteClick = (form) => {
        setFormToDelete(form);
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/forms/${formToDelete._id}`, getAuthHeaders());
            setForms(forms.filter(f => f._id !== formToDelete._id));
            setFormToDelete(null);
        } catch (error) {
            console.error("Failed to delete form:", error);
            alert("Could not delete form.");
            setFormToDelete(null);
        }
    };

    if (loading) {
        return <Loadinganimation text="Loading your forms..." />;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {formToDelete && <DeleteConfirmationModal onConfirm={confirmDelete} onCancel={() => setFormToDelete(null)} formTitle={formToDelete.title} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">My Forms</h2>
                <button onClick={() => setPage('create')} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                    <IconPlus /> Create Form
                </button>
            </div>
            <div className="space-y-4">
                {forms.length > 0 ? forms.map(form => (
                    <div key={form._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                        <span className="font-semibold text-lg">{form.title}</span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleCopyClick(form._id)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300" title="Copy Share Link">
                                {copied[form._id] ? 'Copied!' : <IconClipboard />}
                            </button>
                            <button onClick={() => handleDeleteClick(form)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Delete Form">
                                <IconTrash />
                            </button>
                            <button onClick={() => handleAnalyzeClick(form._id)} className="flex items-center px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
                                <IconChart /> Analyze
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
                        <p>You haven't created any forms yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;