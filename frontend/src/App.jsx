import React, { useEffect, useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BookRoute from "./pages/BookRoute.jsx";
import MapPage from "./pages/Map.jsx";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <div className="w-full bg-trainova-primary text-white dark:bg-trainova-navy border-b border-transparent dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-extrabold tracking-tight">Trainova</Link>
              <span className="h-2 w-2 rounded-full bg-trainova-accent inline-block" />
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm opacity-90">
              <Link to="/" className="hover:opacity-100">Home</Link>
              <Link to="/dashboard" className="hover:opacity-100">Dashboard</Link>
              <Link to="/book" className="hover:opacity-100">Book Route</Link>
              <Link to="/map" className="hover:opacity-100">Map</Link>
              <button onClick={toggleTheme} className="ml-4 inline-flex items-center rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10" aria-label="Toggle dark mode">
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book" element={<BookRoute />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 dark:bg-trainova-navy dark:border-slate-700 dark:text-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-extrabold text-trainova-primary dark:text-white">Trainova</span>
                <span className="h-2 w-2 rounded-full bg-trainova-accent inline-block" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Railway route optimization for fastest, shortest, or most cost‑effective journeys.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><a href="#" target="_blank" rel="noreferrer">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>Email: <a className="text-trainova-primary dark:text-trainova-cyan" href="mailto:contact@trainova.app">contact@trainova.app</a></li>
                <li>Support: <a className="text-trainova-primary dark:text-trainova-cyan" href="#">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400 py-4">© {new Date().getFullYear()} Trainova. All rights reserved.</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
