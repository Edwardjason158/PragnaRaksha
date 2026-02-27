import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import axios from '../api';
import { Download, Navigation, Clock, Shield } from 'lucide-react';

const MapController = ({ routes }) => {
    const map = useMap();
    useEffect(() => {
        if (routes && routes.length > 0 && map) {
            // Find all points from all sequences
            const allPoints = routes.flatMap(r => r.sequence);
            if (allPoints.length > 0) {
                const lats = allPoints.map(p => p.lat);
                const lons = allPoints.map(p => p.lon);
                const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;
                map.setView([centerLat, centerLon], 12);
            }
        }
    }, [routes, map]);
    return null;
};

const PatrolRouteView = () => {
    const [routes, setRoutes] = useState([]);
    const [nHotspots, setNHotspots] = useState(5);
    const [nOfficers, setNOfficers] = useState(2);
    const [loading, setLoading] = useState(false);

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/patrol-route?n_hotspots=${nHotspots}&n_officers=${nOfficers}`);
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoute();
    }, []);

    const routeColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Patrol Route Optimizer</h2>
                    <p className="text-zinc-400">TSP-based sequence for maximum crime deterrence</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Hotspots</span>
                        <input
                            type="number"
                            value={nHotspots}
                            onChange={e => setNHotspots(e.target.value)}
                            className="w-12 bg-transparent text-sm font-bold focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border-white/10">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Officers</span>
                        <input
                            type="number"
                            value={nOfficers}
                            onChange={e => setNOfficers(e.target.value)}
                            className="w-12 bg-transparent text-sm font-bold focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchRoute}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Navigation className="w-4 h-4" />
                        Optimize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                <div className="col-span-8 relative rounded-2xl overflow-hidden glass border-white/10">
                    <MapContainer center={[28.6139, 77.2090]} zoom={12} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapController routes={routes} />
                        {routes.map((route, idx) => (
                            <React.Fragment key={idx}>
                                <Polyline
                                    positions={route.sequence.map(h => [h.lat, h.lon])}
                                    color={routeColors[idx % routeColors.length]}
                                    weight={4}
                                    dashArray="10, 10"
                                />
                                {route.sequence.map((h, hIdx) => (
                                    <Marker key={hIdx} position={[h.lat, h.lon]}>
                                        <Popup>
                                            <div className="p-2">
                                                <p className="font-bold">Hotspot {h.id}</p>
                                                <p className="text-xs text-zinc-500">Priority: High</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </React.Fragment>
                        ))}
                    </MapContainer>
                </div>

                <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
                    {routes.map((route, idx) => (
                        <div key={idx} className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden group">
                            <div
                                className="absolute top-0 left-0 w-1 h-full"
                                style={{ backgroundColor: routeColors[idx % routeColors.length] }}
                            />
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-zinc-300" />
                                    </div>
                                    <h3 className="font-bold">Officer {route.officer_id}</h3>
                                </div>
                                <span className="text-xs font-bold text-zinc-500">ACTIVE</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Navigation className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Distance</span>
                                    </div>
                                    <p className="text-lg font-bold">{route.total_distance_km.toFixed(1)} km</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Est. Time</span>
                                    </div>
                                    <p className="text-lg font-bold">{route.est_time_mins} mins</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Checkpoint Sequence</p>
                                <div className="flex flex-wrap gap-2">
                                    {route.sequence.map((h, hIdx) => (
                                        <div key={hIdx} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/10">
                                            {hIdx + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => window.open(`/api/patrol-route/export?n_hotspots=${nHotspots}&n_officers=${nOfficers}`, '_blank')}
                                className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
                            >
                                <Download className="w-3 h-3" />
                                Export PDF Briefing
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PatrolRouteView;
