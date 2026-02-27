import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const UploadView = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('/api/upload', formData);
            setStatus('success');
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">Data Intake Engine</h2>
                <p className="text-zinc-400">Upload historical crime datasets (CSV) to retrain predictive models</p>
            </div>

            <div className={`glass rounded-3xl p-12 border-2 border-dashed transition-all duration-300 ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'
                }`}>
                {!file ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                            <Upload className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">Drop your CSV here</p>
                            <p className="text-zinc-500 text-sm mt-1">Maximum file size: 50MB</p>
                        </div>
                        <label className="bg-white text-black px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-zinc-200 transition-all">
                            Choose File
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} accept=".csv" />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full flex items-center justify-between glass p-4 rounded-2xl border-white/10">
                            <div className="flex items-center gap-4">
                                <FileText className="text-primary w-8 h-8" />
                                <div className="text-left">
                                    <p className="font-bold">{file.name}</p>
                                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {status === 'idle' && (
                            <button
                                onClick={handleUpload}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
                            >
                                Start Ingestion
                            </button>
                        )}

                        {status === 'uploading' && (
                            <div className="w-full flex flex-col items-center gap-4 py-4">
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-[upload_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                                </div>
                                <p className="text-sm font-bold animate-pulse">Running Spatial Validation...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center gap-4 text-success animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-16 h-16" />
                                <div className="text-center">
                                    <p className="text-xl font-bold">Dataset Integrated</p>
                                    <p className="text-sm opacity-80 mt-1">Models are being updated in the background</p>
                                </div>
                                <button onClick={() => setFile(null)} className="mt-4 text-zinc-400 font-bold text-sm hover:text-white underline underline-offset-4">
                                    Upload another
                                </button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-4 text-danger animate-in zoom-in duration-300">
                                <AlertCircle className="w-16 h-16" />
                                <p className="text-xl font-bold">Validation Failed</p>
                                <p className="text-sm opacity-80 text-center">Missing required columns: [latitude, longitude]</p>
                                <button onClick={() => setStatus('idle')} className="mt-4 bg-white/5 px-6 py-2 rounded-xl text-sm font-bold">
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-3xl border-white/5">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Requirement Checklist
                    </h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2"><span>•</span> <span>WGS84 Coordinates System</span></li>
                        <li className="flex gap-2"><span>•</span> <span>ISO 8601 Date Formats</span></li>
                        <li className="flex gap-2"><span>•</span> <span>UTF-8 Encoding</span></li>
                    </ul>
                </div>
                <div className="glass p-6 rounded-3xl border-white/5">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        Automatic Cleaning
                    </h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2"><span>•</span> <span>Deduplication & Null Handling</span></li>
                        <li className="flex gap-2"><span>•</span> <span>Shift Bucket Automation</span></li>
                        <li className="flex gap-2"><span>•</span> <span>Spatial Index Rebuilding</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UploadView;
