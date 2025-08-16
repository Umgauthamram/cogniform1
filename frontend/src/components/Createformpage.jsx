import React, { useState } from 'react';
import axios from 'axios';

const IconBack = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const API_BASE_URL = 'http://localhost:3001/api';

const CreateFormPage = ({ setPage }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ questionText: '' }]);

    const handleAddQuestion = () => setQuestions([...questions, { questionText: '' }]);

    const handleQuestionTextChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || questions.some(q => !q.questionText.trim())) {
            alert("Please fill out the title and all question fields.");
            return;
        }

        // Helper function to get the auth token from localStorage
        const getAuthHeaders = () => {
            const token = localStorage.getItem('cogniform_token');
            return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        };

        try {
            await axios.post(
                `${API_BASE_URL}/forms/create`, 
                { title, questions }, 
                getAuthHeaders() 
            );
            setPage('dashboard'); 
        } catch (error) {
            console.error("Failed to create form:", error);
            alert("Error: Could not create the form. You may be logged out.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setPage('dashboard')} className="flex items-center text-indigo-600 font-semibold mb-4 hover:underline">
                <IconBack /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold mb-6">Create a New Form</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="formTitle" className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                    <input id="formTitle" type="text" placeholder="e.g., Q3 Project Feedback" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
                {questions.map((q, index) => (
                    <div key={index}>
                        <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700 mb-1">{`Question ${index + 1}`}</label>
                        <input id={`question-${index}`} type="text" placeholder="e.g., What went well?" value={q.questionText} onChange={(e) => handleQuestionTextChange(index, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                ))}
                <div className="flex justify-between items-center pt-4">
                    <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Add Question</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Form</button>
                </div>
            </form>
        </div>
    );
}


export default CreateFormPage;