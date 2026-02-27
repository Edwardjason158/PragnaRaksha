import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';

const HeatLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || !map) return;

        const heatData = points.map(p => [p.lat, p.lon, p.intensity || 0.5]);
        const heatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'yellow', 0.65: 'orange', 1: 'red' }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [points, map]);

    return null;
};

const MapController = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0 && map) {
            const lats = points.map(p => p.lat);
            const lons = points.map(p => p.lon);
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
            const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;
            map.setView([centerLat, centerLon], 12);
        }
    }, [points, map]);
    return null;
};

const HeatmapView = () => {
    const [points, setPoints] = useState([]);
    const [timeRange, setTimeRange] = useState(12);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const res = await axios.get('/api/heatmap');
                setPoints(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Predictive Heatmap</h2>
                    <p className="text-zinc-400">Spatio-temporal crime density analysis</p>
                </div>
                <div className="flex gap-4">
                    <select className="bg-surface border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-primary">
                        <option>All Crime Types</option>
                        <option>Theft</option>
                        <option>Assault</option>
                        <option>Burglary</option>
                    </select>
                    <div className="glass px-4 py-2 rounded-lg flex items-center gap-4">
                        <span className="text-sm font-medium">Time: {timeRange}:00</span>
                        <input
                            type="range"
                            min="0"
                            max="23"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="accent-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                {loading && (
                    <div className="absolute inset-0 z-[1000] glass flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="font-medium animate-pulse">Running Spatio-Temporal Models...</p>
                        </div>
                    </div>
                )}
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <HeatLayer points={points} />
                    <MapController points={points} />
                </MapContainer>

                <div className="absolute bottom-6 left-6 z-[1000] glass p-4 rounded-xl flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Risk Legend</h4>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                        <span className="text-sm font-medium">High Risk (70-100)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                        <span className="text-sm font-medium">Medium Risk (40-69)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                        <span className="text-sm font-medium">Low Risk (0-39)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapView;
