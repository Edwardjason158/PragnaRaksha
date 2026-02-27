import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Database, Zap, RefreshCw } from 'lucide-react';
import axios from '../api';

const UploadView = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef();

    const reset = () => {
        setFile(null);
        setStatus('idle');
        setResult(null);
        setErrorMsg('');
        setProgress(0);
    };

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.endsWith('.csv')) {
            setErrorMsg('Only .csv files are supported.');
            setStatus('error');
            return;
        }
        setFile(f);
        setStatus('idle');
        setErrorMsg('');
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        handleFile(f);
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = () => setDragOver(false);

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        setProgress(0);

        // Simulate progress steps
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + Math.random() * 15, 85));
        }, 300);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/upload', formData);
            clearInterval(progressInterval);
            setProgress(100);
            setResult(res.data);
            setTimeout(() => setStatus('success'), 400);
        } catch (err) {
            clearInterval(progressInterval);
            const detail = err?.response?.data?.detail || err.message || 'Upload failed. Check CSV format.';
            setErrorMsg(detail);
            setStatus('error');
        }
    };

    const requirements = [
        { col: 'latitude', desc: 'WGS84 decimal degrees' },
        { col: 'longitude', desc: 'WGS84 decimal degrees' },
        { col: 'crime_date', desc: 'YYYY-MM-DD format' },
        { col: 'crime_time', desc: 'HH:MM:SS format' },
        { col: 'crime_type', desc: 'Theft, Robbery, etc.' },
        { col: 'area_name', desc: 'Locality / zone name' },
    ];

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Data Intake Engine</h2>
                <p className="text-zinc-400 mt-1">Upload historical crime datasets (CSV) to feed the predictive models</p>
            </div>

            {/* Drop zone */}
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`glass rounded-3xl p-12 border-2 border-dashed transition-all duration-300 ${dragOver ? 'border-primary bg-primary/10 scale-[1.01]' :
                        file ? 'border-primary/50 bg-primary/5' :
                            'border-white/10 hover:border-white/25'
                    }`}
            >
                {status === 'idle' && !file && (
                    <div className="flex flex-col items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-primary text-white' : 'bg-white/5 text-zinc-500'}`}>
                            <Upload className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{dragOver ? 'Drop it!' : 'Drag & drop your CSV here'}</p>
                            <p className="text-zinc-500 text-sm mt-1">or click to browse — max 50MB, .csv only</p>
                        </div>
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-zinc-200 transition-all"
                        >
                            Choose File
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={e => handleFile(e.target.files[0])}
                        />
                    </div>
                )}

                {status === 'idle' && file && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full flex items-center justify-between glass p-4 rounded-2xl border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileText className="text-primary w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">{file.name}</p>
                                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={reset} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        <button
                            onClick={handleUpload}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap className="w-5 h-5" />
                            Start Ingestion
                        </button>
                    </div>
                )}

                {status === 'uploading' && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                                <span>Running Spatial Validation...</span>
                                <span>{Math.floor(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 animate-pulse">Processing {file?.name}...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 text-success animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16" />
                        <div className="text-center">
                            <p className="text-2xl font-bold">Dataset Integrated!</p>
                            {result && (
                                <p className="text-zinc-400 mt-2">
                                    ✅ <strong>{result.rows.toLocaleString()}</strong> records processed — models updated
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Upload Another
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 text-danger animate-in zoom-in duration-300">
                        <AlertCircle className="w-16 h-16" />
                        <p className="text-xl font-bold">Upload Failed</p>
                        <div className="glass px-6 py-3 rounded-xl border border-danger/20 text-center max-w-md">
                            <p className="text-sm text-zinc-300">{errorMsg || 'An unknown error occurred'}</p>
                        </div>
                        <button onClick={reset} className="mt-2 bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Schema requirements */}
            <div className="grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-3xl border-white/5">
                    <h4 className="font-bold text-base mb-5 flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Required CSV Columns
                    </h4>
                    <div className="space-y-3">
                        {requirements.map(r => (
                            <div key={r.col} className="flex items-center gap-3">
                                <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">{r.col}</span>
                                <span className="text-xs text-zinc-400">{r.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border-white/5">
                    <h4 className="font-bold text-base mb-5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Auto-Processing Steps
                    </h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        {[
                            'Deduplication & null row removal',
                            'Date & time format normalization',
                            'Shift bucket assignment (Morning, Evening, Night)',
                            'Severity score computation',
                            'Heatmap cache refresh',
                            'ML model retraining with new data',
                        ].map((step, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UploadView;
