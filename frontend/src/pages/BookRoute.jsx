import React, { useEffect, useMemo, useState } from "react";

export default function BookRoute() {
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [quota, setQuota] = useState("General");
  const [cls, setCls] = useState("All Class");
  const [criterion, setCriterion] = useState("distance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState(null);

  useEffect(() => {
    try {
      const mapFrom = localStorage.getItem('mapFrom') || '';
      const mapTo = localStorage.getItem('mapTo') || '';
      if (mapFrom) setSource((prev)=> prev || mapFrom);
      if (mapTo) setDestination((prev)=> prev || mapTo);
      if (mapFrom || mapTo) {
        localStorage.removeItem('mapFrom');
        localStorage.removeItem('mapTo');
      }
      const saved = JSON.parse(localStorage.getItem('bookRouteForm')||'{}');
      if (saved) {
        setSource((v)=> v || saved.source || '');
        setDestination((v)=> v || saved.destination || '');
        setDate(saved.date || '');
        setQuota(saved.quota || 'General');
        setCls(saved.cls || 'All Class');
        setCriterion(saved.criterion || 'distance');
      }
    } catch(_) {}
  }, []);

  useEffect(() => {
    try {
      const payload = { source, destination, date, quota, cls, criterion };
      localStorage.setItem('bookRouteForm', JSON.stringify(payload));
    } catch(_) {}
  }, [source, destination, date, quota, cls, criterion]);

  const todayStr = new Date().toISOString().split('T')[0];

  const swap = () => {
    setSource((s) => {
      const a = destination;
      setDestination(s);
      return a;
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const sRes = await fetch(`/stations`);
        const sJson = await sRes.json();
        setStations(sJson.stations || []);
      } catch (_) {}
    })();
  }, []);

  const findId = (val) => {
    if (!val) return "";
    if (stations.some((s) => s.id === val)) return val;
    const lower = String(val).toLowerCase();
    const byName = stations.find((s) => (s.name || "").toLowerCase() === lower);
    if (byName) return byName.id;
    const matches = stations.filter((s) => s.id.toLowerCase().includes(lower) || (s.name||"").toLowerCase().includes(lower));
    if (matches.length === 1) return matches[0].id;
    return val;
  };

  const stationOptions = useMemo(()=>stations.map(s=>({ value: s.id, label: `${s.name} (${s.id})`, id: s.id })),[stations]);
  const filteredFrom = useMemo(()=>{
    const q = String(source||"").toLowerCase();
    return q? stationOptions.filter(o=>o.value.toLowerCase().includes(q)||o.label.toLowerCase().includes(q)).slice(0,6):[];
  },[source, stationOptions]);
  const filteredTo = useMemo(()=>{
    const q = String(destination||"").toLowerCase();
    return q? stationOptions.filter(o=>o.value.toLowerCase().includes(q)||o.label.toLowerCase().includes(q)).slice(0,6):[];
  },[destination, stationOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoute(null);
    try {
      const payload = { source: findId(source), destination: findId(destination), criterion };
      const res = await fetch(`/route`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = null; }
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || raw || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setRoute(data || null);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-trainova-primary/10 via-transparent to-trainova-cyan/10" />
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative overflow-hidden rounded-2xl p-8 mb-8 bg-gradient-to-br from-trainova-primary/90 via-trainova-primary/70 to-trainova-cyan/80 text-white">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="relative text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Book Route</h1>
            <p className="text-white/90 mt-2">Plan your journey and find the best route</p>
          </div>
        </div>

        <div className="rounded-2xl backdrop-blur bg-white/70 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-6">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-6 gap-4 items-center relative">
          <select value={quota} onChange={(e)=>setQuota(e.target.value)} className="hidden md:block rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary">
            <option>General</option>
            <option>Senior</option>
            <option>Student</option>
          </select>
          <select value={cls} onChange={(e)=>setCls(e.target.value)} className="hidden md:block rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary">
            <option>All Class</option>
            <option>First</option>
            <option>Second</option>
          </select>
          <div className="col-span-2 md:col-span-2">
            <input placeholder="From (type name or ID)" value={source} onChange={(e)=>setSource(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
            {filteredFrom.length>0 && (
              <div className="mt-1 max-h-48 overflow-auto rounded-md border border-slate-200 bg-white shadow z-10">
                {filteredFrom.map(opt=> (
                  <div key={opt.id} onClick={()=>setSource(opt.value)} className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer">{opt.label}</div>
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center justify-center">
            <button type="button" onClick={swap} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow hover:brightness-110" title="Swap">
              ⇅
            </button>
          </div>
          <div className="col-span-2 md:col-span-2">
            <input placeholder="To (type name or ID)" value={destination} onChange={(e)=>setDestination(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
            {filteredTo.length>0 && (
              <div className="mt-1 max-h-48 overflow-auto rounded-md border border-slate-200 bg-white shadow z-10">
                {filteredTo.map(opt=> (
                  <div key={opt.id} onClick={()=>setDestination(opt.value)} className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer">{opt.label}</div>
                ))}
              </div>
            )}
          </div>
          <input placeholder="Journey Date" type="date" min={todayStr} value={date} onChange={(e)=>setDate(e.target.value)} className="col-span-2 md:col-span-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary" />
          <select value={criterion} onChange={(e)=>setCriterion(e.target.value)} className="col-span-2 md:col-span-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trainova-primary">
            <option value="distance">Shortest Distance</option>
            <option value="time">Fastest Time</option>
            <option value="cost">Lowest Cost</option>
          </select>
          <button type="submit" className="col-span-2 md:col-span-1 inline-flex items-center justify-center rounded-lg bg-trainova-primary hover:brightness-110 text-white font-semibold px-4 py-3 text-sm">Search</button>
          <datalist id="stations-list">
            {stations.map((s) => (
              <option key={s.id} value={s.id} label={`${s.name} (${s.id})`}></option>
            ))}
          </datalist>
        </form>

        {loading && (
          <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-56 bg-slate-200 rounded"></div>
              <div className="flex gap-3">
                <div className="h-4 w-40 bg-slate-200 rounded"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-4 w-28 bg-slate-200 rounded"></div>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded"></div>
              <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
            </div>
          </div>
        )}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {route && (
          <div className="mt-8 rounded-2xl backdrop-blur bg-white/80 dark:bg-slate-900/60 ring-1 ring-white/40 dark:ring-white/10 shadow-xl shadow-black/10 p-6 animate-fadeInUp">
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
            {route.totals && (
              <div className="mt-3 text-sm text-slate-700">
                {(() => {
                  const km = Number(route.totals.distance_km || 0);
                  const fare = km * 1.2;
                  return <div className="inline-flex items-center gap-2"><span className="font-medium">Estimated Fare:</span> ₹{fare.toFixed(0)}</div>;
                })()}
              </div>
            )}
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
            <div className="mt-4 flex items-center gap-3">
              {(() => {
                const ids = route.station_ids || route.optimized_route || [];
                if (ids.length >= 2) {
                  const qs = encodeURIComponent(ids.join(','));
                  return (
                    <a href={`/map?station_ids=${qs}`} className="inline-flex items-center rounded-lg bg-green-600 hover:brightness-110 text-white font-semibold px-3 py-2 text-sm">View on Map</a>
                  );
                }
                return null;
              })()}
              <span className="inline-flex items-center rounded-lg bg-slate-800 text-white font-semibold px-3 py-2 text-sm opacity-70 cursor-not-allowed">Book Now (coming soon)</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
