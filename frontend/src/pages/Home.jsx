import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  React.useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">InterviewGPT</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-gray-900 font-semibold"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            AI Resume Analyzer & Interview Preparation
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get your resume ATS-optimized and prepare for interviews with AI-powered guidance
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Get Started
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📄 Resume Analysis</h3>
            <p className="text-gray-600">Upload your resume and get instant ATS score with actionable improvements.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">🧠 Interview Prep</h3>
            <p className="text-gray-600">Generate role-specific interview questions and get model answers.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">💬 AI Chat</h3>
            <p className="text-gray-600">Chat with AI for personalized interview coaching and feedback.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
