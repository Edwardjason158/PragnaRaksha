import React from 'react';
import { LayoutDashboard, Map, Route, Upload, BarChart3, Settings, ShieldAlert, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'heatmap', label: 'Crime Map', icon: Map },
        { id: 'patrol', label: 'Patrol Optimizer', icon: Route },
        { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
        { id: 'upload', label: 'Data Intake', icon: Upload },
        { id: 'xai', label: 'Explainable AI', icon: ShieldAlert },
    ];

    return (
        <div className="w-64 h-screen glass border-r border-white/5 flex flex-col p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldAlert className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight">Antigravity</h1>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">PCHAS System</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'group-hover:text-white'}`} />
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="pt-6 border-t border-white/10 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">System Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger/80 hover:bg-danger/10 hover:text-danger transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
