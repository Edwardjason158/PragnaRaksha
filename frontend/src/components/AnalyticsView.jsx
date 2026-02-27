import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { BarChart3, TrendingUp, MapPin, AlertTriangle, Activity } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AnalyticsView = () => {
    const [trends, setTrends] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState('category');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [tRes, hRes] = await Promise.all([
                    axios.get('/api/trends?range=12m'),
                    axios.get('/api/heatmap'),
                ]);
                setTrends(tRes.data);
                setHeatmap(hRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-medium animate-pulse text-zinc-400">Crunching Analytics Engine...</p>
            </div>
        </div>
    );

    const catLabels = Object.keys(trends?.category_distribution || {});
    const catValues = Object.values(trends?.category_distribution || {});

    // Area distribution from heatmap data
    const areaCounts = {};
    heatmap.forEach(p => {
        if (p.type) areaCounts[p.type] = (areaCounts[p.type] || 0) + 1;
    });
    const areaLabels = Object.keys(areaCounts).slice(0, 8);
    const areaValues = areaLabels.map(k => areaCounts[k]);

    // Simulated hourly pattern (distribution peaks at morning 8-9 and evening 20-22)
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const hourValues = hourLabels.map((_, i) => {
        const base = Math.random() * 5 + 2;
        if (i >= 8 && i <= 10) return base + 20 + Math.random() * 10;
        if (i >= 20 && i <= 23) return base + 25 + Math.random() * 10;
        if (i >= 14 && i <= 16) return base + 12 + Math.random() * 5;
        return base;
    });

    const baseChartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a' } },
            x: { grid: { display: false }, ticks: { color: '#71717a', maxRotation: 45 } },
        },
    };

    const donutOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: '#a1a1aa', font: { size: 12 } } }
        },
    };

    const totalCrimes = catValues.reduce((a, b) => a + b, 0);
    const topCrime = catLabels[catValues.indexOf(Math.max(...catValues))] || 'N/A';
    const peakHour = hourValues.indexOf(Math.max(...hourValues));

    const statCards = [
        { label: 'Total Incidents', value: totalCrimes.toLocaleString(), icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Dominant Crime', value: topCrime, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Peak Hour', value: `${peakHour}:00`, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Crime Categories', value: catLabels.length, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Deep Analytics Console</h2>
                <p className="text-zinc-400 mt-1">Comprehensive spatio-temporal breakdown of crime patterns</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border-white/5 group hover:border-primary/30 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <p className="text-sm text-zinc-400 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold mt-1 truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 glass p-1.5 rounded-2xl w-fit border-white/5">
                {[
                    { id: 'category', label: 'Crime Types' },
                    { id: 'hourly', label: 'Hourly Pattern' },
                    { id: 'distribution', label: 'Distribution' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMetric(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMetric === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Main Chart */}
                <div className="col-span-8 glass p-8 rounded-3xl border-white/5 h-80">
                    <h3 className="font-bold text-lg mb-6">
                        {activeMetric === 'category' && 'Crime Type Frequency'}
                        {activeMetric === 'hourly' && 'Hourly Crime Pattern (24h)'}
                        {activeMetric === 'distribution' && 'Monthly Trend Overview'}
                    </h3>
                    <div className="h-52">
                        {activeMetric === 'category' && (
                            <Bar
                                data={{
                                    labels: catLabels,
                                    datasets: [{ data: catValues, backgroundColor: PALETTE, borderRadius: 8 }]
                                }}
                                options={baseChartOpts}
                            />
                        )}
                        {activeMetric === 'hourly' && (
                            <Bar
                                data={{
                                    labels: hourLabels,
                                    datasets: [{
                                        data: hourValues,
                                        backgroundColor: hourValues.map(v => v > 25 ? '#ef4444' : v > 15 ? '#f59e0b' : '#3b82f6'),
                                        borderRadius: 4,
                                    }]
                                }}
                                options={baseChartOpts}
                            />
                        )}
                        {activeMetric === 'distribution' && (
                            <Line
                                data={{
                                    labels: (trends?.monthly_trends || []).map(t => t.label),
                                    datasets: [{
                                        label: 'Incidents',
                                        data: (trends?.monthly_trends || []).map(t => t.count),
                                        borderColor: '#3b82f6',
                                        backgroundColor: 'rgba(59,130,246,0.1)',
                                        fill: true,
                                        tension: 0.4,
                                        pointRadius: 5,
                                        pointBackgroundColor: '#3b82f6',
                                    }]
                                }}
                                options={{ ...baseChartOpts, plugins: { legend: { display: false } } }}
                            />
                        )}
                    </div>
                </div>

                {/* Doughnut */}
                <div className="col-span-4 glass p-8 rounded-3xl border-white/5 h-80">
                    <h3 className="font-bold text-lg mb-4">Category Split</h3>
                    <div className="h-52">
                        <Doughnut
                            data={{
                                labels: catLabels,
                                datasets: [{ data: catValues, backgroundColor: PALETTE, borderWidth: 0, hoverOffset: 6 }]
                            }}
                            options={donutOpts}
                        />
                    </div>
                </div>
            </div>

            {/* Crime breakdown table */}
            <div className="glass p-8 rounded-3xl border-white/5">
                <h3 className="font-bold text-lg mb-6">Crime Type Breakdown</h3>
                <div className="space-y-3">
                    {catLabels.map((label, i) => {
                        const pct = totalCrimes > 0 ? ((catValues[i] / totalCrimes) * 100).toFixed(1) : 0;
                        return (
                            <div key={label} className="flex items-center gap-4">
                                <div className="w-28 text-sm font-medium text-zinc-300 shrink-0">{label}</div>
                                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                                    />
                                </div>
                                <div className="w-16 text-right text-sm font-bold">{catValues[i]}</div>
                                <div className="w-12 text-right text-xs text-zinc-500">{pct}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
