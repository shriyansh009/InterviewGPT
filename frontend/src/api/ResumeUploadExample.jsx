/**
 * Example Component: Resume Upload with API Integration
 * Shows how to use the API client and useAPI hook
 */

import { useState } from "react";
import { apiClient, useAPI } from "@/api";

export function ResumeUploadExample() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const { execute: executeUpload, loading: uploadLoading, error: uploadError } = useAPI();
  const { execute: executeAnalyze, loading: analyzeLoading, error: analyzeError } = useAPI();
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const result = await executeUpload(() => apiClient.uploadResume(file));
      setUploadResult(result);
      setFile(null);
      alert("Resume uploaded successfully!");
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadResult?.file_id) {
      alert("Please upload a resume first");
      return;
    }

    try {
      const result = await executeAnalyze(() => 
        apiClient.analyzeResume(uploadResult.file_id)
      );
      setAnalysisResult(result);
      alert("Analysis complete!");
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Resume Analysis</h2>

      {/* File Input */}
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={uploadLoading}
        />
        <p className="text-sm text-slate-500 mt-1">
          {file ? `Selected: ${file.name}` : "No file selected"}
        </p>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploadLoading || !file}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-blue-700 mb-4"
      >
        {uploadLoading ? "Uploading..." : "Upload Resume"}
      </button>

      {uploadError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          Upload Error: {uploadError}
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
          ✓ Resume uploaded: {uploadResult.filename}
        </div>
      )}

      {/* Analyze Button */}
      {uploadResult && (
        <button
          onClick={handleAnalyze}
          disabled={analyzeLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-green-700 mb-4"
        >
          {analyzeLoading ? "Analyzing..." : "Analyze Resume"}
        </button>
      )}

      {analyzeError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          Analysis Error: {analyzeError}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold mb-2">Analysis Results:</h3>
          <pre className="text-sm overflow-auto max-h-64 bg-white p-2 rounded">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ResumeUploadExample;
