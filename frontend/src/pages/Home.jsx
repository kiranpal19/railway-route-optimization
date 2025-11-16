import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  // Prefer user-provided image placed in /public/train-hero.jpg; fallback to a royalty-free image
  const fallback = "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1600&auto=format&fit=crop";
  const [imgSrc, setImgSrc] = useState("/train-hero.jpg");
  const [stats, setStats] = useState({ stations: 0, connections: 0, cities: 0 });
  useEffect(() => {
    let s = 0, c = 0, ci = 0;
    const id = setInterval(() => {
      s = Math.min(180, s + 9);
      c = Math.min(420, c + 21);
      ci = Math.min(95, ci + 5);
      setStats({ stations: s, connections: c, cities: ci });
      if (s === 180 && c === 420 && ci === 95) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-trainova-slatebg dark:bg-trainova-navy">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={imgSrc} onError={() => setImgSrc(fallback)} alt="Train on bridge" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(37,99,235,0.25),transparent),radial-gradient(50%_50%_at_80%_20%,rgba(16,185,129,0.25),transparent)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{backgroundImage:'radial-gradient(#000 0.75px, transparent 0.75px)', backgroundSize:'3px 3px'}} />
          {/* glowing accent dots */}
          <div className="absolute left-10 top-16 h-3 w-3 rounded-full bg-trainova-accent blur-[2px] opacity-80 animate-glowPulse" />
          <div className="absolute right-14 top-24 h-2.5 w-2.5 rounded-full bg-white/80 blur-[2px] opacity-70 animate-glowPulse" />
          <div className="absolute right-24 bottom-16 h-4 w-4 rounded-full bg-trainova-accent blur-[3px] opacity-70 animate-glowPulse" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl text-white">
            <div className="uppercase tracking-[0.2em] text-xs md:text-sm text-white/80">Safety | Security | Punctuality</div>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-[1.1]">Optimize Your Railway Journey</h1>
            <p className="mt-4 text-white/90 text-base md:text-lg">Plan routes by shortest distance, fastest time, or lowest cost with Trainova’s smart route engine.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book" className="inline-flex items-center rounded-lg bg-trainova-primary hover:brightness-110 text-white font-semibold px-5 py-3 text-sm">Book Route</Link>
              <Link to="/map" className="inline-flex items-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-5 py-3 text-sm">Explore Map</Link>
            </div>
          </div>
          <div className="mt-10 md:mt-16 grid grid-cols-3 max-w-xl text-center text-white/90">
            <div className="py-3">
              <div className="text-3xl font-extrabold">{stats.stations}</div>
              <div className="text-xs uppercase tracking-widest">Stations</div>
            </div>
            <div className="py-3">
              <div className="text-3xl font-extrabold">{stats.connections}</div>
              <div className="text-xs uppercase tracking-widest">Connections</div>
            </div>
            <div className="py-3">
              <div className="text-3xl font-extrabold">{stats.cities}</div>
              <div className="text-xs uppercase tracking-widest">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">How it works</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <div className="text-trainova-primary font-semibold">1. Choose Stations</div>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Pick From/To by typing names or selecting on the live map. Fuzzy search helps you find quickly.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <div className="text-trainova-primary font-semibold">2. Select Criterion</div>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Optimize by shortest distance, fastest time, or lowest cost using our route engine.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <div className="text-trainova-primary font-semibold">3. Book & Visualize</div>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">See segment details, estimated fare, and visualize the path on the India map.</p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="learn" className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Optimization</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Distance, time, and cost criteria with segment insights.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Map</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Auto-fit routes, click-to-select From/To, and network overlay.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Tools</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Inline edits, validation, CSV/JSON import-export, and dedupe.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dark Mode</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">Polished visuals with animations and glowing accents.</p>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-6 md:mx-0">
        <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-trainova-primary to-trainova-cyan text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xl md:text-2xl font-bold">Ready to optimize your journey?</div>
            <div className="text-white/90 text-sm">Start by booking a route or exploring the live network map.</div>
          </div>
          <div className="flex gap-3">
            <Link to="/book" className="inline-flex items-center rounded-lg bg-white text-trainova-primary font-semibold px-5 py-3 text-sm">Book Route</Link>
            <Link to="/map" className="inline-flex items-center rounded-lg bg-white/10 border border-white/30 text-white font-semibold px-5 py-3 text-sm">Explore Map</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
