import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HeatmapView from './components/HeatmapView';
import PatrolRouteView from './components/PatrolRouteView';
import UploadView from './components/UploadView';
import XAIView from './components/XAIView';
import AnalyticsView from './components/AnalyticsView';
import { Bell, Search, User } from 'lucide-react';

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'heatmap': return <HeatmapView />;
            case 'patrol': return <PatrolRouteView />;
            case 'analytics': return <AnalyticsView />;
            case 'upload': return <UploadView />;
            case 'xai': return <XAIView />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-white selection:bg-primary/30">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-[100]">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search zones, incidents, or officers..."
                            className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 glass rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-background" />
                        </button>
                        <div className="h-10 w-[1px] bg-white/10 mx-2" />
                        <div className="flex items-center gap-3 glass pl-2 pr-4 py-1.5 rounded-2xl border-white/5">
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                                <User className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold leading-tight">Cmdr. Edward Jason</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Strategic Analyst</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <section className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {renderContent()}
                </section>
            </main>
        </div>
    );
};

export default App;
