import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const LoadingSpinner = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-4 my-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="text-lg text-gray-600 font-medium">{text}</p>
    </div>
);

function FillFormPage({ formId }) {
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchForm = async () => {
            try {
                // **FIXED**: Using backticks for the URL
                const response = await axios.get(`${API_BASE_URL}/forms/${formId}`);
                setForm(response.data);
            } catch (err) {
                setError("Form not found or the link is invalid.");
                console.error("Failed to fetch form:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [formId]);
    
    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const answersPayload = form.questions.map(q => ({
            questionId: q._id,
            answerText: answers[q._id] || ''
        }));
        
        if (answersPayload.some(a => !a.answerText.trim())) {
            alert("Please answer all questions before submitting.");
            return;
        }

        try {
            // **FIXED**: Using backticks for the URL
            await axios.post(`${API_BASE_URL}/responses/submit/${formId}`, { answers: answersPayload });
            setSubmitted(true);
        } catch (err) {
            setError("An error occurred while submitting your response. Please try again.");
            console.error("Failed to submit response:", err);
        }
    };
    
    if (loading) return <LoadingSpinner text="Loading form..." />;
    if (error) return <p className="text-center text-red-500 font-bold">{error}</p>;
    if (submitted) return (
        <div className="max-w-lg mx-auto text-center bg-white p-10 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
            <p className="text-gray-700 mt-2">Your response has been successfully submitted.</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-2">{form.title}</h2>
                <p className="text-gray-600 mb-6">Please fill out the form below.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {form.questions.map(q => (
                        <div key={q._id}>
                            <label htmlFor={q._id} className="block font-semibold mb-2 text-gray-800">{q.questionText}</label>
                            <textarea
                                id={q._id}
                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                rows="4"
                                required
                            ></textarea>
                        </div>
                    ))}
                    <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all">
                        Submit Response
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FillFormPage;
