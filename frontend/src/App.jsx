import React, { useState, useRef } from 'react';
import { Mic, Upload, FileText, Sparkles, BarChart3, Play, Square, Loader2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Infographic from './Infographic';
import SummaryCard from './SummaryCard';
import ApiKeySettings from './ApiKeySettings';
import { saveAs } from 'file-saver';
import { compressAudio } from './audioUtils';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'http://192.168.5.185:8000');

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        handleUpload(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioBlob(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (blob) => {
    const startTime = Date.now();
    setIsProcessing(true);
    setResults(null);
    setError(null);
    setIsTranscriptExpanded(false);
    setUploadProgress(0);

    try {
      // Compress audio if needed
      console.log('🗜️ Compressing audio...');
      const compressStart = Date.now();
      const compressedBlob = await compressAudio(blob);
      console.log(`✅ Compression completed in ${((Date.now() - compressStart) / 1000).toFixed(2)}s`);

      const formData = new FormData();
      const fileName = blob.name || 'recording.wav';
      formData.append('file', compressedBlob, fileName);

      // 1. Transcribe with upload progress
      console.log('🎤 Starting transcription...');
      const transcribeStart = Date.now();

      // Get API keys from localStorage
      const geminiKey = localStorage.getItem('gemini_api_key');
      const openaiKey = localStorage.getItem('openai_api_key');

      if (!geminiKey || !openaiKey) {
        throw new Error('Please add your API keys in settings (click the gear icon)');
      }

      const transcript = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.transcript);
          } else {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Transcription failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));

        xhr.open('POST', `${API_URL}/transcribe`);
        xhr.setRequestHeader('X-Gemini-API-Key', geminiKey);
        xhr.send(formData);
      });

      console.log(`✅ Transcription completed in ${((Date.now() - transcribeStart) / 1000).toFixed(2)}s`);
      setUploadProgress(0);

      // 2 & 3. Run Summarize and Visualize in PARALLEL
      console.log('📝📊 Starting summarization and visualization in parallel...');
      const parallelStart = Date.now();

      const [summarizeData, visualizeData] = await Promise.all([
        fetch(`${API_URL}/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-OpenAI-API-Key': openaiKey
          },
          body: JSON.stringify({ text: transcript }),
        }).then(res => {
          if (!res.ok) throw new Error("Summarization failed");
          return res.json();
        }),

        fetch(`${API_URL}/visualize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Gemini-API-Key': geminiKey
          },
          body: JSON.stringify({ text: transcript }),
        }).then(res => {
          if (!res.ok) throw new Error("Visualization failed");
          return res.json();
        })
      ]);

      console.log(`✅ Parallel processing completed in ${((Date.now() - parallelStart) / 1000).toFixed(2)}s`);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`🎉 Total processing time: ${totalTime}s`);

      setResults({
        transcript: transcript,
        summary: summarizeData.summary,
        visualData: visualizeData.data,
      });

    } catch (err) {
      console.error('❌ Error:', err.message);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadTranscript = () => {
    if (!results?.transcript) return;

    const blob = new Blob([results.transcript], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `transcript_${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const handleExportVisualizationPDF = async () => {
    if (!results?.visualData) return;

    const element = document.getElementById('visualization-section');
    if (!element) {
      alert('Visualization section not found');
      return;
    }

    // Create a new window with just the visualization
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    // Clone the element and all styles
    const clone = element.cloneNode(true);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visualization Export</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { size: A4; margin: 10mm; }
            }
            ${Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n')}
          </style>
        </head>
        <body>
          ${clone.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (user can cancel)
      setTimeout(() => printWindow.close(), 100);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* API Key Settings */}
      <ApiKeySettings />

      {/* Hero Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-sm">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl md:text-6xl tracking-tight">
          Turn Conversations into <span className="text-blue-600">Visuals</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
          Upload an audio file or record a meeting. We'll summarize it and create an infographic instantly.
        </p>

        {/* Recording / Upload Area */}
        <div className="mt-10 max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 transition-all hover:shadow-2xl">

            {!isProcessing && !results && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold text-white transition-all transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                      }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-6 h-6 mr-2" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 mr-2" /> Start Recording
                      </>
                    )}
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR UPLOAD</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex justify-center">
                  <label className="cursor-pointer flex flex-col items-center group">
                    <div className="p-4 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className="mt-2 text-sm text-slate-500 group-hover:text-slate-700">Click to upload MP3/WAV</span>
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-lg font-medium text-slate-700">Processing audio...</p>
                <p className="text-sm text-slate-500">Transcribing, summarizing, and visualizing.</p>
                {uploadProgress > 0 && (
                  <div className="mt-4 w-64">
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Uploading: {uploadProgress}%</p>
                  </div>
                )}
              </div>
            )}

            {results && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                <button
                  onClick={() => setResults(null)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Start Over
                </button>
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 mt-4">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="mt-2 underline">Try Again</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Results Dashboard */}
      {results && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Transcript Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">1. Transcribe</h2>
                </div>
                <button
                  onClick={handleDownloadTranscript}
                  className="flex items-center px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium transition-colors shadow-sm border border-blue-100"
                  title="Download transcript"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {isTranscriptExpanded ? results.transcript : `${results.transcript.slice(0, 300)}${results.transcript.length > 300 ? '...' : ''}`}
              </p>
              {results.transcript.length > 300 && (
                <button
                  onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                >
                  {isTranscriptExpanded ? 'See Less' : 'See More'}
                </button>
              )}
            </div>

            {/* Summary Card */}
            <SummaryCard summary={results.summary} />

            {/* Visualization Card - Full Width */}
            <div className="col-span-1 md:col-span-3">
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleExportVisualizationPDF}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  title="Export as PDF"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
              <div id="visualization-section">
                <Infographic data={results.visualData} />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
