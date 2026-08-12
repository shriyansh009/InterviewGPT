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
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const QUESTION_TYPES = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "hr", label: "HR" },
];

/* ── Scan-style radial score gauge ──
   The visual metaphor is the ATS itself: a scanner sweeping the resume and
   landing on a readout. The ring animates in once on mount, digits are
   monospace to read like a machine readout rather than a marketing stat. */
function ScoreGauge({ score }) {
  const size = 176;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const clamped = Math.max(0, Math.min(100, score || 0));
  const offset = circumference * (1 - (animated ? clamped : 0) / 100);

  const tone =
    clamped >= 80
      ? { ring: "#0d9488", text: "text-teal-600", bg: "bg-teal-50", label: "Strong match" }
      : clamped >= 60
      ? { ring: "#d97706", text: "text-amber-600", bg: "bg-amber-50", label: "Good match" }
      : { ring: "#e11d48", text: "text-rose-600", bg: "bg-rose-50", label: "Needs work" };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EEF0F2"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.ring}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-4xl font-bold tabular-nums ${tone.text}`}>
            {Math.round(clamped)}
          </span>
          <span className="font-mono text-[11px] text-gray-400 tracking-wide">/ 100</span>
        </div>
      </div>
      <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full ${tone.bg} ${tone.text} px-3 py-1 text-xs font-bold uppercase tracking-wide`}>
        {tone.label}
      </span>
    </div>
  );
}

/* ── Minimal inline toast, replaces alert() ── */
function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 text-sm bg-white animate-[fadeIn_.15s_ease-out] ${
            t.type === "error" ? "border-rose-200" : "border-teal-200"
          }`}
        >
          {t.type === "error" ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          )}
          <p className="flex-1 text-gray-700">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="text-gray-300 hover:text-gray-500">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Analysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionType, setQuestionType] = useState("technical");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [rightTab, setRightTab] = useState("prep"); // "prep" | "chat"
  const [toasts, setToasts] = useState([]);

  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const pushToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  useEffect(() => {
    // Fetch chat history only when switching to the Chat tab or when analysisId changes
    if (rightTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      (async () => {
        try {
          const token = localStorage.getItem("auth_token");
          const resp = await fetch(`${API_BASE}/chat/history?analysis_id=${analysisId}&token=${token}`);
          if (resp.ok) {
            const data = await resp.json();
            setChatMessages(data.map((m) => ({ role: m.role, message: m.message })));
          }
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
      })();
    }
  }, [rightTab, analysisId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE}/analysis/${analysisId}?token=${token}`);

      if (response.ok) {
        const data = await response.json();

        if (typeof data.matching_skills === "string") {
          data.matching_skills = JSON.parse(data.matching_skills || "[]");
        }
        if (typeof data.missing_skills === "string") {
          data.missing_skills = JSON.parse(data.missing_skills || "[]");
        }
        if (typeof data.suggestions === "string") {
          data.suggestions = JSON.parse(data.suggestions || "[]");
        }
        console.log(data)
        setAnalysis(data);
      } else {
        pushToast("We couldn't load this analysis. Redirecting to your dashboard.", "error");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
      pushToast("Something went wrong loading this analysis.", "error");
      setTimeout(() => navigate("/dashboard"), 1200);
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
        `${API_BASE}/analysis/generate-questions/${analysisId}?question_type=${questionType}&token=${token}`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        setExpandedQuestion(0);
        setRightTab("prep");
      } else {
        const error = await response.json().catch(() => ({}));
        pushToast(error.detail || "Couldn't generate questions right now.", "error");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      pushToast("Couldn't generate questions right now.", "error");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || sendingMessage) return;

    const userMessage = chatInput;
    setChatInput("");
    setSendingMessage(true);
    setChatMessages((prev) => [...prev, { role: "user", message: userMessage }]);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE}/chat/message?analysis_id=${analysisId}&token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", message: userMessage }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { role: "assistant", message: data.assistant_message }]);
      } else {
        const error = await response.json().catch(() => ({}));
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", message: `Error: ${error.detail || "Failed to get response"}` },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", message: "Error: Failed to send message" },
      ]);
    } finally {
      setSendingMessage(false);
      chatInputRef.current?.focus();
    }
  };

  const handleCopyAnswer = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      pushToast("Couldn't copy — select the text manually.", "error");
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-40 bg-gray-200 rounded mb-8" />
          <div className="h-40 bg-white border border-gray-100 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
            <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 pb-16 flex items-center justify-center">
        <p className="text-rose-600">Analysis not found</p>
      </div>
    );
  }

  const matchingSkills = Array.isArray(analysis.matching_skills) ? analysis.matching_skills : [];
  const missingSkills = Array.isArray(analysis.missing_skills) ? analysis.missing_skills : [];
  const suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : [];

  return (
    <>
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <div className="min-h-screen bg-gray-50 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Header ── */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 rounded"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to dashboard
            </button>
            <p className="font-mono text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">
              Resume analysis
            </p>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-3xl font-extrabold text-gray-900">How your resume stacks up</h1>
              <p className="text-sm text-gray-400 font-mono">
                {new Date(analysis.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* ── Overview band: gauge + quick read ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center gap-8">
            <ScoreGauge score={analysis.ats_score} />
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
                  <p className="font-mono text-2xl font-bold text-teal-700 tabular-nums">
                    {matchingSkills.length}
                  </p>
                  <p className="text-xs font-semibold text-teal-700/80 uppercase tracking-wide">
                    Matching skills
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
                    {missingSkills.length}
                  </p>
                  <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wide">
                    Skill gaps
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {suggestions.length > 0
                  ? "We've broken down exactly what's working, what's missing, and how to close the gap below."
                  : "Here's what matched and what didn't — scroll down for the full breakdown."}
              </p>
            </div>
          </div>

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* ── Left: Skills & improvements ── */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-gray-800">Matching skills</h2>
                </div>
                <div className="p-6">
                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No matching skills identified yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                  <h2 className="font-bold text-gray-800">Skill gaps</h2>
                </div>
                <div className="p-6">
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No gaps found — nice work.</p>
                  )}
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-gray-800">How to improve</h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Prep / Ask tabbed panel ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[640px]">
              {/* Tab switcher */}
              <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 flex-shrink-0">
                <button
                  onClick={() => setRightTab("prep")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors focus:outline-none ${
                    rightTab === "prep"
                      ? "text-teal-700 bg-teal-50 border-b-2 border-teal-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <SparklesIcon className="w-4 h-4" />
                  Interview prep
                </button>
                <button
                  onClick={() => setRightTab("chat")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors focus:outline-none ${
                    rightTab === "chat"
                      ? "text-teal-700 bg-teal-50 border-b-2 border-teal-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Ask questions
                  {chatMessages.length > 0 && (
                    <span className="ml-1 text-[10px] font-mono bg-gray-200 text-gray-600 rounded-full px-1.5">
                      {chatMessages.length}
                    </span>
                  )}
                </button>
              </div>

              {/* ── Interview prep tab ── */}
              {rightTab === "prep" && (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Question type
                    </label>
                    <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1">
                      {QUESTION_TYPES.map((qt) => (
                        <button
                          key={qt.value}
                          onClick={() => setQuestionType(qt.value)}
                          className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none ${
                            questionType === qt.value
                              ? "bg-white text-teal-700 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {qt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateQuestions}
                    disabled={generatingQuestions}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {generatingQuestions ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Generating questions…
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        {questions.length > 0 ? "Regenerate questions" : "Generate questions"}
                      </>
                    )}
                  </button>

                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((question, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                            className="w-full flex items-start justify-between gap-3 p-4 hover:bg-gray-50 transition-colors text-left focus:outline-none"
                          >
                            <p className="font-medium text-gray-800 text-sm">
                              <span className="font-mono text-gray-400 mr-2">{String(idx + 1).padStart(2, "0")}</span>
                              {question.question_text}
                            </p>
                            <ChevronDownIcon
                              className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                expandedQuestion === idx ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {expandedQuestion === idx && (
                            <div className="border-t border-gray-100 p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  Model answer
                                </p>
                                <button
                                  onClick={() => handleCopyAnswer(question.model_answer, idx)}
                                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-teal-600 transition-colors"
                                >
                                  {copiedIdx === idx ? (
                                    <>
                                      <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-teal-600" />
                                      <span className="text-teal-600">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="prose max-w-none text-sm text-gray-700 leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.model_answer || ""}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
                      <SparklesIcon className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-sm max-w-xs">
                        Pick a question type and generate a set of practice Q&As tailored to this role.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Chat tab ── */}
              {rightTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                          Ask follow-up questions about this analysis or get advice on closing your skill gaps.
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-teal-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose max-w-none text-sm text-gray-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message || ""}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.message
                          )}
                        </div>
                      </div>
                    ))}
                    {sendingMessage && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="border-t border-gray-100 p-4 flex gap-2 flex-shrink-0">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask a question…"
                      className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-50 outline-none"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || sendingMessage}
                      aria-label="Send message"
                      className="px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Analysis;