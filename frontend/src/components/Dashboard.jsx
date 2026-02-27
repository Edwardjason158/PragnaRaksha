import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { TrendingUp, ShieldAlert, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('12m');

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/trends?range=${range}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, [range]);

    if (loading || !data) return <div className="flex items-center justify-center h-full">Loading Engine...</div>;

    const lineData = {
        labels: data.monthly_trends.map(t => t.label),
        datasets: [{
            label: 'Overall Crime Incidence',
            data: data.monthly_trends.map(t => t.count),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
        }]
    };

    const barData = {
        labels: Object.keys(data.category_distribution),
        datasets: [{
            label: 'Incidents by Category',
            data: Object.values(data.category_distribution),
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
            borderRadius: 8,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#71717a' } },
            x: { grid: { display: false }, ticks: { color: '#71717a' } },
        }
    };

    const stats = [
        { label: 'System Accuracy', value: '88.4%', icon: Target, trend: '+2.1%', up: true },
        { label: 'Active Hotspots', value: '12', icon: ShieldAlert, trend: '-4', up: false },
        { label: 'Prediction Confidence', value: '92%', icon: Zap, trend: '+0.5%', up: true },
        { label: 'Response Target', value: '<5min', icon: TrendingUp, trend: '-15s', up: false },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Executive Command Overview</h2>
                <p className="text-zinc-400">Tactical insights derived from spatio-temporal modeling</p>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border-white/5 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-success' : 'text-danger'}`}>
                                {stat.trend}
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6 h-[400px]">
                <div className="col-span-8 glass p-8 rounded-3xl border-white/5 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Predictive Temporal Trends</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRange('12m')}
                                className={`px-3 py-1 rounded-lg transition-all ${range === '12m' ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'} text-xs font-bold`}
                            >
                                12 Months
                            </button>
                            <button
                                onClick={() => setRange('30d')}
                                className={`px-3 py-1 rounded-lg transition-all ${range === '30d' ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'} text-xs font-bold`}
                            >
                                30 Days
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                <div className="col-span-4 glass p-8 rounded-3xl border-white/5 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Categorical Distribution</h3>
                    <div className="flex-1 min-h-0">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
