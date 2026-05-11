import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";
import { useAuth } from "@/context/AuthContext";
import { apiClient, useAPI } from "@/api";

// ── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 50 }) {
  if (!score) return (
    <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 whitespace-nowrap">
      pending
    </span>
  );
  const color   = score >= 80 ? "#0d9488" : score >= 60 ? "#d97706" : "#dc2626";
  const bgColor = score >= 80 ? "#f0fdf9" : score >= 60 ? "#fffbeb" : "#fef2f2";
  const r    = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, background: bgColor, borderRadius: "50%" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={3.5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 10, fontWeight: 700, color,
      }}>
        {score}%
      </span>
    </div>
  );
}

const tips = [
  { icon: ClockIcon,                color: "text-indigo-500", bg: "bg-indigo-50", title: "Tailor every resume",    body: "Generic resumes score 20–30% lower on ATS systems. Customise for each role." },
  { icon: StarIcon,                 color: "text-amber-500",  bg: "bg-amber-50",  title: "Target 80%+ ATS",        body: "Scores below 60% are rarely seen by a human recruiter." },
  { icon: ChatBubbleLeftRightIcon,  color: "text-teal-500",   bg: "bg-teal-50",   title: "Practice makes perfect", body: "3–5 mock sessions dramatically improve your real interview confidence." },
];

// ── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading: apiLoading } = useAPI();
  
  const [dragOver,       setDragOver]       = useState(false);
  const [resumes,        setResumes]        = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading,      setUploading]      = useState(false);
  const [uploadSuccess,  setUploadSuccess]  = useState(false);
  const [analysing,      setAnalysing]      = useState(false);
  const [stats,          setStats]          = useState([
    { label: "Resumes Uploaded", value: "0",   icon: DocumentTextIcon,        bg: "bg-teal-50",   iconColor: "text-teal-600",   border: "border-teal-100" },
    { label: "Analyses Run",     value: "0",  icon: ChartBarIcon,            bg: "bg-amber-50",  iconColor: "text-amber-600",  border: "border-amber-100" },
    { label: "Avg ATS Score",    value: "–",  icon: StarIcon,                bg: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100" },
    { label: "Mock Interviews",  value: "0",   icon: ChatBubbleLeftRightIcon, bg: "bg-pink-50",   iconColor: "text-pink-600",   border: "border-pink-100" },
  ]);
  
  const fileRef = useRef();

  // Load resumes on mount
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/resumes?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        updateStats(data);
      } else if (response.status === 404) {
        // Endpoint doesn't exist yet, use mock data
        console.warn("Resumes endpoint not found");
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);
    }
  };

  const updateStats = (resumesList) => {
    const analysed = resumesList.filter(r => r.status === "analysed").length;
    const scores = resumesList.filter(r => r.ats_score).map(r => r.ats_score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "–";

    setStats(prev => [
      { ...prev[0], value: resumesList.length.toString() },
      { ...prev[1], value: analysed.toString() },
      { ...prev[2], value: typeof avgScore === "number" ? `${avgScore}%` : "–" },
      { ...prev[3], value: "0" }, // Mock interviews placeholder
    ]);
  };

  const handleDrop = (e) => {
    e.preventDefault(); 
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleUpload = async (file) => {
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/upload-resume?token=${token}`,
        { method: "POST", body: formData }
      );

      if (response.ok) {
        const newResume = await response.json();
        setResumes(prev => [newResume, ...prev]);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        loadResumes();
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/resume/${id}?token=${token}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setResumes(prev => prev.filter(r => r.id !== id));
        if (selectedResume === id) setSelectedResume(null);
      } else if (response.status === 404) {
        // Endpoint not implemented, just remove locally
        setResumes(prev => prev.filter(r => r.id !== id));
        if (selectedResume === id) setSelectedResume(null);
      } else {
        const error = await response.json().catch(() => ({}));
        alert("Failed to delete: " + (error.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      // Still remove locally on network error
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResume === id) setSelectedResume(null);
    }
  };

  const handleAnalyse = async () => {
    if (!selectedResume || !jobDescription.trim()) return;

    setAnalysing(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analysis/analyze?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_id: selectedResume,
            job_description: jobDescription
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Navigate to analysis details page
        navigate(`/analysis/${result.id}`);
      } else {
        const error = await response.json().catch(() => ({}));
        alert("Analysis failed: " + (error.detail || "Please try again."));
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analysis failed: " + error.message);
    } finally {
      setAnalysing(false);
    }
  };

  const canAnalyse = selectedResume && jobDescription.trim() && !analysing;
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* ── Greeting ── */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-teal-600">{firstName}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">Here's your interview prep overview for today.</p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map(({ label, value, icon: Icon, bg, iconColor, border }) => (
              <div key={label} className={`bg-white rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Resume panel (spans 2 cols) ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-teal-500" />
                    My Resumes
                  </h2>
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5">
                    {resumes.length} file{resumes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-6">

                  {/* Drop zone */}
                  <div
                    onClick={() => !uploading && fileRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={[
                      "rounded-xl border-2 border-dashed p-8 text-center cursor-pointer mb-6 transition-all",
                      dragOver                             ? "border-teal-400 bg-teal-50" : "",
                      uploading                            ? "border-indigo-300 bg-indigo-50 pointer-events-none" : "",
                      uploadSuccess                        ? "border-teal-400 bg-teal-50" : "",
                      !dragOver && !uploading && !uploadSuccess ? "border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/50" : "",
                    ].join(" ")}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.docx" hidden onChange={handleFileChange} />

                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-semibold text-indigo-600">Uploading & processing…</p>
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircleIcon className="w-10 h-10 text-teal-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-teal-600">Upload successful!</p>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Drag & drop your resume here</p>
                        <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 10 MB</p>
                        <button className="mt-4 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 hover:bg-teal-100 transition-colors">
                          Browse files
                        </button>
                      </>
                    )}
                  </div>

                  {/* Resume list */}
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedResume(r.id === selectedResume ? null : r.id)}
                        className={[
                          "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                          selectedResume === r.id
                            ? "border-teal-300 bg-teal-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/40",
                        ].join(" ")}
                      >
                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.filename}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString()} · {r.size || "–"}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ScoreRing score={r.ats_score} size={48} />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            r.status === "analysed"
                              ? "bg-teal-50 text-teal-600 border-teal-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {r.status}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {resumes.length === 0 && (
                      <p className="text-center text-sm text-gray-400 py-6">No resumes yet. Upload one above!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right col ── */}
            <div className="flex flex-col gap-6">

              {/* Analyse panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <BoltIcon className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-gray-800">Analyse Resume</h2>
                </div>
                <div className="p-6 flex flex-col gap-4">

                  {/* Selected resume */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selected Resume</p>
                    {selectedResume ? (
                      <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5">
                        <CheckCircleIcon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-teal-700 truncate">
                          {resumes.find(r => r.id === selectedResume)?.filename}
                        </span>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 rounded-xl px-3 py-2.5 text-center">
                        <span className="text-xs text-gray-400">← Select a resume from the list</span>
                      </div>
                    )}
                  </div>

                  {/* JD textarea */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Job Description</p>
                    <textarea
                      className="w-full h-36 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3.5 resize-y outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition placeholder-gray-300 leading-relaxed"
                      placeholder={"Paste the job description here…\n\ne.g. We are looking for a Senior React Engineer with 4+ years of experience…"}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAnalyse}
                    disabled={!canAnalyse}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      canAnalyse
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <SparklesIcon className="w-4 h-4" />
                    {analysing ? "Analysing…" : "Run ATS Analysis"}
                  </button>

                  {!canAnalyse && (
                    <p className="text-center text-xs text-gray-400 -mt-2 italic">
                      {!selectedResume ? "Select a resume to continue" : "Add a job description to continue"}
                    </p>
                  )}
                </div>
              </div>

              {/* Tips panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">💡 Pro Tips</p>
                <div className="space-y-4">
                  {tips.map(({ icon: Icon, color, bg, title, body }) => (
                    <div key={title} className="flex gap-3 items-start">
                      <div className={`${bg} rounded-lg p-2 flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">{title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA banner */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-500 rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Ready to practise?</p>
                <p className="text-base font-bold leading-snug mb-4">Jump into a mock interview session now</p>
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-white text-teal-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Start Interview <ArrowRightIcon className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Dashboard;