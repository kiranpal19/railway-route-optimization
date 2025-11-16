import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [tab, setTab] = useState("search");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [criterion, setCriterion] = useState("distance");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stations, setStations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [newStation, setNewStation] = useState({ id: "", name: "" });
  const [stationFilter, setStationFilter] = useState("");
  const [editingStationId, setEditingStationId] = useState("");
  const [editStation, setEditStation] = useState({ name: "", lat: "", lon: "" });
  const [newConn, setNewConn] = useState({
    source_id: "",
    dest_id: "",
    distance_km: "",
    speed_kmh: "",
    cost: "",
  });
  const [importText, setImportText] = useState("");
  const [importConnText, setImportConnText] = useState("");

  const stationOptions = useMemo(()=>stations.map(s=>({ value: s.id, label: `${s.name} (${s.id})`, id: s.id })),[stations]);
  const filteredFrom = useMemo(()=>{
    const q = String(source||"").toLowerCase();
    return q? stationOptions.filter(o=>o.value.toLowerCase().includes(q)||o.label.toLowerCase().includes(q)).slice(0,6):[];
  },[source, stationOptions]);
  const filteredTo = useMemo(()=>{
    const q = String(destination||"").toLowerCase();
    return q? stationOptions.filter(o=>o.value.toLowerCase().includes(q)||o.label.toLowerCase().includes(q)).slice(0,6):[];
  },[destination, stationOptions]);

  const refreshData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`/stations`),
        fetch(`/connections`),
      ]);
      const sJson = await sRes.json();
      const cJson = await cRes.json();
      setStations(sJson.stations || []);
      setConnections(cJson.connections || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Prefill from Map selections if present
  useEffect(() => {
    const mapFrom = localStorage.getItem('mapFrom') || '';
    const mapTo = localStorage.getItem('mapTo') || '';
    if (mapFrom && !source) setSource(mapFrom);
    if (mapTo && !destination) setDestination(mapTo);
    if (mapFrom || mapTo) {
      localStorage.removeItem('mapFrom');
      localStorage.removeItem('mapTo');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRoute(null);
    setError("");
    try {
      // Ensure we submit valid station IDs even if user typed names
      const findId = (val) => {
        if (!val) return "";
        if (stations.some((s) => s.id === val)) return val;
        const lower = String(val).toLowerCase();
        const byName = stations.find((s) => (s.name || "").toLowerCase() === lower);
        if (byName) return byName.id;
        // fuzzy: if exactly one station matches substring on id or name, use it
        const matches = stations.filter((s) => s.id.toLowerCase().includes(lower) || (s.name||"").toLowerCase().includes(lower));
        if (matches.length === 1) return matches[0].id;
        return val;
      };
      const payload = { source: findId(source), destination: findId(destination), criterion };
      const res = await fetch(`/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Robustly parse response (may be empty or non-JSON on errors)
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = null; }
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || raw || ("HTTP " + res.status);
        throw new Error(msg);
      }
      setRoute(data || null);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const baseTabBtn = "flex-1 py-3 rounded-lg text-sm font-semibold transition";
  const searchActive = "bg-white shadow-sm text-trainova-primary ring-1 ring-slate-200";
  const searchInactive = "text-slate-700 hover:text-slate-900";
  const adminActive = "bg-trainova-primary text-white";
  const adminInactive = "text-slate-700 hover:text-slate-900";
  const searchBtnClass = baseTabBtn + " " + (tab === "search" ? searchActive : searchInactive);
  const adminBtnClass = baseTabBtn + " " + (tab === "admin" ? adminActive : adminInactive);

  return (
    <div className="relative">
      {/* Page background: soft mesh + grain */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-trainova-primary/10 via-transparent to-trainova-cyan/10" />
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Page header band */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8 bg-gradient-to-br from-trainova-primary/90 via-trainova-primary/70 to-trainova-cyan/80 text-white">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="relative text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-white/90 mt-2">Search routes or manage the network</p>
        </div>
      </div>

      <div className="rounded-2xl backdrop-blur bg-white/70 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-3 animate-fadeInUp">
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button onClick={() => setTab("search")} className={searchBtnClass}>User (Search)</button>
          <button onClick={() => setTab("admin")} className={adminBtnClass}>Admin</button>
        </div>

        {tab === "search" && (
          <div className="p-8">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1 relative">
                <input placeholder="From (type name or ID)" value={source} onChange={(e) => setSource(e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                {filteredFrom.length>0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow">
                    {filteredFrom.map(opt => (
                      <div key={opt.id} onClick={()=>setSource(opt.value)} className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer">{opt.label}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-1 relative">
                <input placeholder="To (type name or ID)" value={destination} onChange={(e) => setDestination(e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                {filteredTo.length>0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow">
                    {filteredTo.map(opt => (
                      <div key={opt.id} onClick={()=>setDestination(opt.value)} className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer">{opt.label}</div>
                    ))}
                  </div>
                )}
              </div>
              <select value={criterion} onChange={(e) => setCriterion(e.target.value)} className="md:col-span-1 w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary">
                <option value="distance">Shortest Distance</option>
                <option value="time">Fastest Time</option>
                <option value="cost">Lowest Cost</option>
              </select>
              <button type="submit" className="md:col-span-1 inline-flex items-center justify-center rounded-lg bg-trainova-primary hover:brightness-110 text-white font-semibold px-4 py-3 shadow">
                Find Route
              </button>
            </form>

            {loading && (
              <div className="mt-6 rounded-xl backdrop-blur bg-white/70 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 w-56 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="flex gap-3">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            )}
            {error && <p className="mt-6 text-red-600">{error}</p>}

            {route && (
              <div className="mt-8 rounded-xl backdrop-blur bg-white/80 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-6 animate-fadeInUp">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-trainova-primary">Optimized Route ({route.criterion})</h3>
                  {route.totals && (
                    <div className="text-sm text-slate-700 flex flex-wrap gap-4">
                      <span className="px-2 py-0.5 rounded-full bg-trainova-accent text-slate-900">Distance: {route.totals.distance_km?.toFixed(2)} km</span>
                      <span>Time: {route.totals.time_hours?.toFixed(2)} h</span>
                      <span>Cost: {route.totals.cost?.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-slate-800">
                  {route.station_names ? (
                    <p className="text-xl">{route.station_names.join(" ➜ ")}</p>
                  ) : (
                    <p className="text-xl">{(route.optimized_route || []).join(" ➜ ")}</p>
                  )}
                </div>
                {/* Fare estimate (simple) */}
                {route.totals && (
                  <div className="mt-3 text-sm text-slate-700">
                    {(() => {
                      const km = Number(route.totals.distance_km || 0);
                      const fare = km * 1.2; // base rate per km
                      return <div className="inline-flex items-center gap-2"><span className="font-medium">Estimated Fare:</span> ₹{fare.toFixed(0)}</div>;
                    })()}
                  </div>
                )}
                {/* Segment details */}
                {Array.isArray(route.edges) && route.edges.length > 0 && (
                  <div className="mt-5 grid gap-3">
                    {route.edges.map((e, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono">{e.source_id} ➜ {e.dest_id}</span>
                          <span className="text-slate-600">{Number(e.distance_km||0).toFixed(1)} km</span>
                          <span className="text-slate-600">{Number(e.speed_kmh||0) > 0 ? (Number(e.distance_km||0)/(Number(e.speed_kmh)||1e-6)).toFixed(2) : '—'} h</span>
                          <span className="text-slate-600">₹{Number(e.cost||0).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  {(() => {
                    const ids = route.station_ids || route.optimized_route || [];
                    if (ids.length >= 2) {
                      const qs = encodeURIComponent(ids.join(','));
                      return (
                        <Link to={"/map?station_ids=" + qs} className="inline-flex items-center rounded-lg bg-green-600 hover:brightness-110 text-white font-semibold px-3 py-2 text-sm">View on Map</Link>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "admin" && (
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div className="rounded-xl backdrop-blur bg-white/80 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-6 animate-fadeInUp">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Add Station</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`/stations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newStation) });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to add station");
                  setNewStation({ id: "", name: "", lat: "", lon: "" });
                  refreshData();
                } catch (err) { alert(err.message); }
              }} className="grid grid-cols-1 gap-5">
                <input placeholder="Station ID" value={newStation.id || ""} onChange={(e) => setNewStation({ ...newStation, id: e.target.value })} required className="w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <input placeholder="Station Name" value={newStation.name || ""} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })} required className="w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.000001" placeholder="Latitude (optional)" value={newStation.lat || ""} onChange={(e) => setNewStation({ ...newStation, lat: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                  <input type="number" step="0.000001" placeholder="Longitude (optional)" value={newStation.lon || ""} onChange={(e) => setNewStation({ ...newStation, lon: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-trainova-primary hover:brightness-110 text-white font-semibold px-4 py-3">Add</button>
              </form>
              <div className="mt-4">
                <button onClick={async () => { try { const r = await fetch('/seed', { method: 'POST' }); await r.json(); refreshData(); } catch (_) {} }} className="inline-flex items-center justify-center rounded-lg bg-slate-800 text-white font-semibold px-3 py-2">Seed Demo Data</button>
                <button onClick={async () => { try { const r = await fetch('/dump'); const data = await r.json(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'trainova-data.json'; a.click(); URL.revokeObjectURL(url); } catch (e) { alert('Export failed'); } }} className="ml-2 inline-flex items-center justify-center rounded-lg bg-trainova-primary text-white font-semibold px-3 py-2">Export JSON</button>
              </div>
              <div className="mt-3">
                <textarea value={importText} onChange={(e)=>setImportText(e.target.value)} placeholder="Paste exported JSON here to import" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
                <div className="mt-2 flex gap-2">
                  <button onClick={async ()=>{ try { const payload = JSON.parse(importText || '{}'); const r = await fetch('/load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const j = await r.json(); if (!r.ok) throw new Error(j.error||'Import failed'); setImportText(''); refreshData(); alert('Import successful'); } catch (e) { alert(e.message || 'Invalid JSON'); } }} className="inline-flex items-center justify-center rounded-lg bg-green-600 text-white font-semibold px-3 py-2 text-sm">Import JSON</button>
                  <button onClick={()=>setImportText('')} className="inline-flex items-center justify-center rounded-lg bg-slate-200 text-slate-800 font-semibold px-3 py-2 text-sm">Clear</button>
                </div>
              </div>
              {/* CSV Export/Import */}
              <div className="mt-6">
                <h4 className="font-medium mb-2 text-slate-800">CSV Import/Export</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button onClick={()=>{
                    const rows = [['id','name','lat','lon'], ...stations.map(s=>[s.id, s.name, s.lat ?? '', s.lon ?? ''])];
                    const csv = rows.map(r=>r.map(v=>('"' + String(v).replaceAll('"','""') + '"')).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='stations.csv'; a.click(); URL.revokeObjectURL(url);
                  }} className="rounded-lg bg-slate-800 text-white px-3 py-2 text-sm">Export Stations CSV</button>
                  <button onClick={()=>{
                    const rows = [['source_id','dest_id','distance_km','speed_kmh','cost'], ...connections.map(c=>[c.source_id, c.dest_id, c.distance_km ?? '', c.speed_kmh ?? '', c.cost ?? ''])];
                    const csv = rows.map(r=>r.map(v=>('"' + String(v).replaceAll('"','""') + '"')).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='connections.csv'; a.click(); URL.revokeObjectURL(url);
                  }} className="rounded-lg bg-slate-800 text-white px-3 py-2 text-sm">Export Connections CSV</button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <textarea value={importText} onChange={(e)=>setImportText(e.target.value)} placeholder="Stations CSV: id,name,lat,lon (header required)" rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
                    <button onClick={async ()=>{
                      try {
                        const lines = (importText||'').trim().split(/\r?\n/); if (lines.length<2) throw new Error('No rows');
                        const headers = lines.shift().split(',').map(h=>h.replaceAll('"','').trim().toLowerCase());
                        const idx = { id: headers.indexOf('id'), name: headers.indexOf('name'), lat: headers.indexOf('lat'), lon: headers.indexOf('lon') };
                        if (idx.id<0||idx.name<0) throw new Error('Headers must include id,name');
                        const st = lines.map(l=>{ const cols=l.split(',').map(x=>x.replace(/^\"|\"$/g,'').replaceAll('""','"')); return { id: cols[idx.id], name: cols[idx.name], lat: cols[idx.lat]||'', lon: cols[idx.lon]||'' }; });
                        const payload = { stations: st, connections };
                        const r = await fetch('/load', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
                        const j = await r.json(); if (!r.ok) throw new Error(j.error||'Import failed'); refreshData(); alert('Stations CSV imported');
                      } catch(e) { alert(e.message); }
                    }} className="mt-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm">Import Stations CSV</button>
                  </div>
                  <div>
                    <textarea value={importConnText} onChange={(e)=>setImportConnText(e.target.value)} placeholder="Connections CSV: source_id,dest_id,distance_km,speed_kmh,cost (header required)" rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
                    <button onClick={async ()=>{
                      try {
                        const lines = (importConnText||'').trim().split(/\r?\n/); if (lines.length<2) throw new Error('No rows');
                        const headers = lines.shift().split(',').map(h=>h.replaceAll('"','').trim().toLowerCase());
                        const idx = { s: headers.indexOf('source_id'), d: headers.indexOf('dest_id'), dist: headers.indexOf('distance_km'), spd: headers.indexOf('speed_kmh'), cost: headers.indexOf('cost') };
                        if (idx.s<0||idx.d<0) throw new Error('Headers must include source_id,dest_id');
                        const conns = lines.map(l=>{ const cols=l.split(',').map(x=>x.replace(/^\"|\"$/g,'').replaceAll('""','"')); return { source_id: cols[idx.s], dest_id: cols[idx.d], distance_km: parseFloat(cols[idx.dist]||0)||0, speed_kmh: parseFloat(cols[idx.spd]||0)||0, cost: parseFloat(cols[idx.cost]||0)||0 }; });
                        // validate station ids exist
                        const ids = new Set(stations.map(s=>s.id));
                        for (const e of conns) { if (!ids.has(e.source_id) || !ids.has(e.dest_id)) throw new Error(`Unknown station in ${e.source_id}->${e.dest_id}`); }
                        // merge into existing via POSTs (dedupe on backend)
                        for (const e of conns) { try { await fetch('/connections', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(e)}); } catch(_) {} }
                        refreshData(); alert('Connections CSV imported');
                      } catch(e) { alert(e.message); }
                    }} className="mt-2 rounded-lg bg-green-600 text-white px-3 py-2 text-sm">Import Connections CSV</button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="font-medium text-slate-800">Stations ({stations.length})</h4>
                  <input value={stationFilter} onChange={(e)=>setStationFilter(e.target.value)} placeholder="Filter by id or name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr><th className="text-left px-3 py-2">ID</th><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Lat</th><th className="text-left px-3 py-2">Lon</th><th className="px-3 py-2">Actions</th></tr>
                    </thead>
                    <tbody>
                      {stations
                        .filter((s)=>{
                          const q = stationFilter.toLowerCase();
                          if (!q) return true;
                          return s.id.toLowerCase().includes(q) || (s.name||"").toLowerCase().includes(q);
                        })
                        .map((s) => (
                        <tr key={s.id} className="border-t border-slate-200">
                          <td className="px-3 py-2 font-mono align-top">{s.id}</td>
                          <td className="px-3 py-2 align-top">
                            {editingStationId === s.id ? (
                              <input value={editStation.name} onChange={(e)=>setEditStation({ ...editStation, name: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1" />
                            ) : s.name}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {editingStationId === s.id ? (
                              <input type="number" step="0.000001" value={editStation.lat} onChange={(e)=>setEditStation({ ...editStation, lat: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1" />
                            ) : (s.lat ?? "")}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {editingStationId === s.id ? (
                              <input type="number" step="0.000001" value={editStation.lon} onChange={(e)=>setEditStation({ ...editStation, lon: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1" />
                            ) : (s.lon ?? "")}
                          </td>
                          <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                            {editingStationId === s.id ? (
                              <div className="flex gap-2 justify-end">
                                <button onClick={async ()=>{ try { const res = await fetch(`/stations/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editStation.name, lat: editStation.lat, lon: editStation.lon }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error||'Update failed'); setEditingStationId(""); setEditStation({ name: "", lat: "", lon: "" }); refreshData(); } catch(err){ alert(err.message); } }} className="px-2 py-1 rounded bg-trainova-primary text-white text-xs">Save</button>
                                <button onClick={()=>{ setEditingStationId(""); setEditStation({ name: "", lat: "", lon: "" }); }} className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-xs">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button onClick={()=>{ setEditingStationId(s.id); setEditStation({ name: s.name || "", lat: s.lat ?? "", lon: s.lon ?? "" }); }} className="px-2 py-1 rounded bg-slate-800 text-white text-xs">Edit</button>
                                <button onClick={async ()=>{ if(!confirm('Delete station and its connections?')) return; try { const res = await fetch(`/stations/${s.id}`, { method: 'DELETE' }); const data = await res.json(); if (!res.ok) throw new Error(data.error||'Delete failed'); refreshData(); } catch(err){ alert(err.message); } }} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-xl backdrop-blur bg-white/80 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-6 animate-fadeInUp">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Add Connection</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = { ...newConn, distance_km: parseFloat(newConn.distance_km || 0), speed_kmh: parseFloat(newConn.speed_kmh || 0), cost: parseFloat(newConn.cost || 0) };
                  const res = await fetch(`/connections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to add connection");
                  setNewConn({ source_id: "", dest_id: "", distance_km: "", speed_kmh: "", cost: "" });
                  refreshData();
                } catch (err) { alert(err.message); }
              }} className="grid grid-cols-2 gap-5">
                <input placeholder="Source ID" value={newConn.source_id} onChange={(e) => setNewConn({ ...newConn, source_id: e.target.value })} required className="col-span-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <input placeholder="Destination ID" value={newConn.dest_id} onChange={(e) => setNewConn({ ...newConn, dest_id: e.target.value })} required className="col-span-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <input type="number" step="0.01" placeholder="Distance (km)" value={newConn.distance_km} onChange={(e) => setNewConn({ ...newConn, distance_km: e.target.value })} required className="col-span-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <input type="number" step="0.01" placeholder="Speed (km/h)" value={newConn.speed_kmh} onChange={(e) => setNewConn({ ...newConn, speed_kmh: e.target.value })} className="col-span-1 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <input type="number" step="0.01" placeholder="Cost" value={newConn.cost} onChange={(e) => setNewConn({ ...newConn, cost: e.target.value })} className="col-span-2 w-full rounded-lg border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
                <button type="submit" className="col-span-2 inline-flex items-center justify-center rounded-lg bg-trainova-primary hover:brightness-110 text-white font-semibold px-4 py-3">Add</button>
              </form>
              <div className="mt-4">
                <h4 className="font-medium mb-2 text-slate-800">Connections ({connections.length})</h4>
                <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-3 py-2">From</th>
                        <th className="text-left px-3 py-2">To</th>
                        <th className="text-left px-3 py-2">Dist (km)</th>
                        <th className="text-left px-3 py-2">Speed (km/h)</th>
                        <th className="text-left px-3 py-2">Cost</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connections.map((c, i) => (
                        <tr key={i} className="border-t border-slate-200">
                          <td className="px-3 py-2 font-mono">{c.source_id}</td>
                          <td className="px-3 py-2 font-mono">{c.dest_id}</td>
                          <td className="px-3 py-2">{c.distance_km}</td>
                          <td className="px-3 py-2">{c.speed_kmh}</td>
                          <td className="px-3 py-2">{c.cost}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={async ()=>{ try { const res = await fetch('/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source_id: c.source_id, dest_id: c.dest_id }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error||'Delete failed'); refreshData(); } catch(err){ alert(err.message); } }} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
