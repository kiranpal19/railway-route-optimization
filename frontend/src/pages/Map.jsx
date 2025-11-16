import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { useLocation } from "react-router-dom";

export default function MapPage() {
  const location = useLocation();
  const [stations, setStations] = useState([]);
  const [connections, setConnections] = useState([]);
  const mapRef = useRef(null);
  const [pickFrom, setPickFrom] = useState("");
  const [pickTo, setPickTo] = useState("");

  const refresh = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch('/stations'),
        fetch('/connections'),
      ]);
      const sJson = await sRes.json();
      const cJson = await cRes.json();
      const toNum = (v) => {
        if (v === null || v === undefined || v === '') return undefined;
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const st = (sJson.stations || []).map((s) => ({
        ...s,
        lat: toNum(s.lat),
        lon: toNum(s.lon),
      }));
      setStations(st);
      setConnections(cJson.connections || []);
    } catch (_) {}
  };

  useEffect(() => { refresh(); }, []);

  const center = [22.5, 79.0];
  const zoom = 5;

  // Parse highlighted route from query (?station_ids=A,B,C)
  const routeIds = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const csv = params.get('station_ids') || '';
    return csv.split(',').map(s => s.trim()).filter(Boolean);
  }, [location.search]);

  const fitBounds = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const allPts = stations.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number');
    if (routeIds.length >= 2) {
      const pts = routeIds
        .map(id => allPts.find(s => s.id === id))
        .filter(Boolean)
        .map(s => [s.lat, s.lon]);
      if (pts.length >= 2) {
        const bounds = pts.reduce((b, p) => b.extend(p), map.getBounds().pad(0));
        map.fitBounds(bounds, { padding: [24, 24] });
        return;
      }
    }
    const pts = allPts.map(s => [s.lat, s.lon]);
    if (pts.length === 0) return;
    const bounds = pts.reduce((b, p) => b.extend(p), map.getBounds().pad(0));
    map.fitBounds(bounds, { padding: [24, 24] });
  };

  useEffect(() => { if (stations.length) fitBounds(); }, [stations, routeIds]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Network Map</h1>
        <p className="text-slate-600 mt-2">Stations and connections across India</p>
      </div>
      <div className="h-[560px] rounded-xl overflow-hidden border border-slate-200">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} whenCreated={(m)=> (mapRef.current = m)}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {connections.map((e, i) => {
            const a = stations.find(s => s.id === e.source_id);
            const b = stations.find(s => s.id === e.dest_id);
            if (!a || !b || typeof a.lat !== 'number' || typeof a.lon !== 'number' || typeof b.lat !== 'number' || typeof b.lon !== 'number') return null;
            return <Polyline key={`n-${i}`} positions={[[a.lat, a.lon], [b.lat, b.lon]]} pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.4 }} />;
          })}
          {routeIds.length >= 2 && (
            (() => {
              const pts = routeIds
                .map(id => stations.find(s => s.id === id))
                .filter(Boolean)
                .map(s => [s.lat, s.lon]);
              if (pts.length >= 2) {
                return <Polyline positions={pts} pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.9 }} />;
              }
              return null;
            })()
          )}
          {stations.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number').map((s) => (
            <Marker key={s.id} position={[s.lat, s.lon]} eventHandlers={{ click: () => {
              if (!pickFrom || (pickFrom && pickTo)) { setPickFrom(s.id); setPickTo(""); }
              else if (!pickTo) { setPickTo(s.id); }
            } }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-slate-600">{s.id}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={fitBounds} className="rounded-lg bg-trainova-primary text-white px-3 py-2">Fit to Network</button>
        <button onClick={refresh} className="rounded-lg bg-slate-800 text-white px-3 py-2">Refresh Data</button>
      </div>
      <div className="fixed bottom-6 right-6 bg-white border border-slate-200 shadow-lg rounded-xl p-4 w-64">
        <div className="text-sm text-slate-700">
          <div><span className="font-medium">From:</span> {pickFrom || '—'}</div>
          <div className="mt-1"><span className="font-medium">To:</span> {pickTo || '—'}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setPickFrom(""); setPickTo(""); }} className="rounded-md bg-slate-200 text-slate-800 px-2 py-1 text-xs">Clear</button>
            <button disabled={!pickFrom || !pickTo} onClick={() => { localStorage.setItem('mapFrom', pickFrom); localStorage.setItem('mapTo', pickTo); window.location.href = '/dashboard'; }} className={`rounded-md px-2 py-1 text-xs ${(!pickFrom||!pickTo)?'bg-slate-300 text-slate-500':'bg-green-600 text-white'}`}>Open in Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
