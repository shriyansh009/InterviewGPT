import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Analysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/analysis/analysis/${analysisId}`);
      setAnalysis(response.data);
      
      // Fetch questions
      const questionsResponse = await api.get(`/analysis/questions/${analysisId}`);
      setQuestions(questionsResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async (type) => {
    setGeneratingQuestions(true);
    try {
      const response = await api.post(
        `/analysis/generate-questions/${analysisId}?question_type=${type}`
      );
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleStartChat = () => {
    navigate(`/chat/${analysisId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analysis...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Analysis not found</p>
      </div>
    );
  }

  const missingSkills = analysis.missing_skills ? JSON.parse(analysis.missing_skills) : [];
  const suggestions = analysis.suggestions ? JSON.parse(analysis.suggestions) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">InterviewGPT</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* ATS Score */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ATS Score</h2>
          <div className="flex items-center">
            <div className="text-6xl font-bold text-blue-600">{analysis.ats_score?.toFixed(1) || 0}</div>
            <div className="ml-8">
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${analysis.ats_score || 0}%` }}
                />
              </div>
              <p className="text-gray-600 mt-2">Match Score</p>
            </div>
          </div>
        </div>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Skills</h2>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Suggestions</h2>
            <ul className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interview Questions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Preparation</h2>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => generateQuestions('hr')}
              disabled={generatingQuestions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              HR Questions
            </button>
            <button
              onClick={() => generateQuestions('technical')}
              disabled={generatingQuestions}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Technical Questions
            </button>
            <button
              onClick={handleStartChat}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg ml-auto"
            >
              Start Chat
            </button>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((question, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">{idx + 1}. {question.question_text}</p>
                  {question.model_answer && (
                    <details>
                      <summary className="text-blue-600 cursor-pointer font-medium mb-2">
                        View Model Answer
                      </summary>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded mt-2">{question.model_answer}</p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
