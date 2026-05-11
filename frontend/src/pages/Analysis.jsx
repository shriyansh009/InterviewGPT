import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";
import { useAuth } from "@/context/AuthContext";

export function Analysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [analysis, setAnalysis] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionType, setQuestionType] = useState("technical");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadAnalysis = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/analysis/${analysisId}?token=${token}`
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        
        // Parse JSON fields
        if (typeof data.matching_skills === "string") {
          data.matching_skills = JSON.parse(data.matching_skills || "[]");
        }
        if (typeof data.missing_skills === "string") {
          data.missing_skills = JSON.parse(data.missing_skills || "[]");
        }
        if (typeof data.suggestions === "string") {
          data.suggestions = JSON.parse(data.suggestions || "[]");
        }
      } else {
        alert("Failed to load analysis");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
      alert("Error loading analysis");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!analysisId) return;

    setGeneratingQuestions(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/generate-questions/${analysisId}?question_type=${questionType}&token=${token}`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        const error = await response.json().catch(() => ({}));
        alert("Failed to generate questions: " + (error.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Error generating questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setSendingMessage(true);

    try {
      setChatMessages(prev => [...prev, { role: "user", message: userMessage }]);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chat/message?analysis_id=${analysisId}&token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", message: userMessage })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: "assistant", message: data.assistant_message }]);
      } else {
        const error = await response.json().catch(() => ({}));
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          message: `Error: ${error.detail || "Failed to get response"}` 
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        message: "Error: Failed to send message" 
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <p className="text-red-600">Analysis not found</p>
      </div>
    );
  }

  const matchingSkills = Array.isArray(analysis.matching_skills) 
    ? analysis.matching_skills 
    : [];
  const missingSkills = Array.isArray(analysis.missing_skills) 
    ? analysis.missing_skills 
    : [];
  const suggestions = Array.isArray(analysis.suggestions) 
    ? analysis.suggestions 
    : [];

  const scoreColor = analysis.ats_score >= 80 ? "text-teal-600" : 
                     analysis.ats_score >= 60 ? "text-amber-600" : 
                     "text-red-600";

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Header ── */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Analysis Results</h1>
            <p className="text-sm text-gray-500">
              Analysed on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Analysis Results (spans 2 cols) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ATS Score Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">ATS Score</p>
                  <div className={`text-6xl font-extrabold ${scoreColor} mb-2`}>
                    {Math.round(analysis.ats_score)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        analysis.ats_score >= 80 ? "bg-teal-600" :
                        analysis.ats_score >= 60 ? "bg-amber-600" :
                        "bg-red-600"
                      }`}
                      style={{ width: `${Math.min(analysis.ats_score, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {analysis.ats_score >= 80 ? "Excellent match!" :
                     analysis.ats_score >= 60 ? "Good match" :
                     "Needs improvement"}
                  </p>
                </div>
              </div>

              {/* Matching Skills */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-gray-800">Matching Skills</h2>
                </div>
                <div className="p-6">
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium px-3 py-2 rounded-lg"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No matching skills identified</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                  <h2 className="font-bold text-gray-800">Missing Skills</h2>
                </div>
                <div className="p-6">
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-3 py-2 rounded-lg"
                        >
                          ⚠ {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No missing skills</p>
                  )}
                </div>
              </div>

              {/* Generate Questions Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-gray-800">Interview Questions</h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Question Type
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="hr">HR</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={generatingQuestions}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    {generatingQuestions ? "Generating..." : "Generate Questions"}
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right: Chat & Questions ── */}
            <div className="flex flex-col gap-6">

{/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-gray-800">Suggestions</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-indigo-600 font-bold flex-shrink-0">→</span>
                          <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              

              {/* Chat Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-96">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-gray-800">Ask Questions</h2>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      Ask questions about this analysis...
                    </p>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-50 p-4 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-50 outline-none"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || sendingMessage}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                  >
                    Send
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Generated Questions */}
          {questions.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-gray-800">Generated {questionType.charAt(0).toUpperCase() + questionType.slice(1)} Questions</h2>
              </div>
              <div className="p-6 space-y-3">
                {questions.map((question, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-left font-medium text-gray-800 text-sm">
                        {idx + 1}. {question.question_text}
                      </p>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                          expandedQuestion === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedQuestion === idx && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Model Answer</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{question.model_answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Analysis;
