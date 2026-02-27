import React from 'react';
import { ShieldCheck, Info, Brain, Zap, AlertTriangle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const XAIView = () => {
    const featureImportance = {
        labels: ['Spatial Density', 'Time Weight', 'Crime Category', 'Recency Spike', 'Victim Profile'],
        datasets: [{
            label: 'Influence %',
            data: [42, 28, 15, 10, 5],
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#71717a' } },
            y: { grid: { display: false }, ticks: { color: '#71717a' } }
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Explainable AI (XAI) Console</h2>
                    <p className="text-zinc-400">Deconstructing model decisions for transparent policing</p>
                </div>
                <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full border border-success/20">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Model Verified</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl border-white/5 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <Brain className="w-6 h-6 text-primary" />
                        <h3 className="font-bold text-lg">Feature Importance (SHAP)</h3>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <Bar data={featureImportance} options={chartOptions} />
                    </div>
                    <p className="text-sm text-zinc-500 italic">
                        *Spatial density remains the primary driver of risk scores in the current training iteration.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-warning w-5 h-5" />
                            <h4 className="font-bold">Confidence Calibration</h4>
                        </div>
                        <div className="flex items-end gap-4">
                            <span className="text-5xl font-black text-white">94.2%</span>
                            <span className="text-sm text-zinc-500 mb-2">Aggregate Reliability</span>
                        </div>
                        <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-warning w-[94%] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5 bg-primary/5">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <Info className="w-5 h-5" />
                            <h4 className="font-bold">Bias-Awareness Note</h4>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            PCHAS utilizes anonymized spatio-temporal data. Model training excludes socioeconomic markers to mitigate demographic bias. Risk scores are purely geographic and temporal based on historical incidence density.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5 border-danger/20 bg-danger/5">
                        <div className="flex items-center gap-3 mb-4 text-danger">
                            <AlertTriangle className="w-5 h-5" />
                            <h4 className="font-bold">Model Degradation Alert</h4>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Data drift detected in "Saket" zone. Model retraining recommended to maintain 85%+ F1-score accuracy.
                        </p>
                        <button className="mt-4 w-full bg-danger/20 hover:bg-danger text-danger hover:text-white py-2 rounded-xl text-xs font-bold transition-all border border-danger/30">
                            Queue Retraining
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XAIView;
