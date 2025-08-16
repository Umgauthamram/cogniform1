import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loadinganimation from '../ui/Loadinganimation';

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('cogniform_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const IconBack = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;

const ImprovementSuggestion = ({ text }) => (
    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="ml-3">
                <p className="text-sm font-bold text-yellow-800">Actionable Suggestion</p>
                <p className="text-sm text-yellow-700 mt-1">{text}</p>
            </div>
        </div>
    </div>
);

const AnalysisResultCard = ({ category, summary, sentiment, improvement, responseCount, sampleResponses }) => {
    const sentimentColors = {
        Positive: "bg-green-100 text-green-800",
        Negative: "bg-red-100 text-red-800",
        Neutral: "bg-gray-100 text-gray-800",
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden border border-gray-200 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 mr-2">{category}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sentimentColors[sentiment] || sentimentColors.Neutral}`}>
                        {sentiment}
                    </span>
                </div>
                <p className="text-gray-600 mb-4">{summary}</p>
                {improvement && <ImprovementSuggestion text={improvement} />}
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-500 mb-2">{responseCount} matching responses. Samples:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 italic">
                    {sampleResponses.map((resp, index) => <li key={index} className="truncate">"{resp}"</li>)}
                </ul>
            </div>
        </div>
    );
};

const AnalysisPage = ({ formId, setPage }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!formId) {
                setError("No form selected for analysis.");
                setLoading(false);
                return;
            }
            try {

                const response = await axios.get(`${API_BASE_URL}/analyze/${formId}`, getAuthHeaders());
                setAnalysis(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Analysis failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [formId]);

    if (loading) return <Loadinganimation text="Performing advanced analysis..." />;

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => setPage('dashboard')} className="flex items-center text-indigo-600 font-semibold mb-6 hover:underline">
                <IconBack /> Back to Dashboard
            </button>
            {error && (
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{error}</p>
                </div>
            )}
            {analysis && Object.keys(analysis).length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(analysis).map(([questionId, data]) => (
                        <div key={questionId}>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Insights for Question:</h2>
                            <p className="text-xl text-gray-600 mb-6 italic">"{data.questionText}"</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {data.results.map((item, index) => <AnalysisResultCard key={index} {...item} />)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error && (
                <p className="text-center text-gray-500 mt-10">No analysis data to display.</p>
            )}
        </div>
    );
}


export default AnalysisPage;