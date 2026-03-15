import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Activity, AlertTriangle, Lock, LogIn } from 'lucide-react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT21luHbw-OWHxkiZ419zr41Isdun-Pw8PkAqy1n4MLypq6ffCn3_2LpaxthO_c-EzDxQEOy9AvfQq1/pub?output=csv';

// --- Login Component ---
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Admin@123') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to access BalanceSense</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wide uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wide uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-8"
          >
            <LogIn className="w-5 h-5" />
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('balanceSenseAuth') === 'true';
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;
    
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        try {
          const validRows = results.data.filter(row => row.Left !== undefined && row.Right !== undefined);
          setData(validRows.reverse());
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
    let interval;
    if (isAuthenticated) {
      interval = setInterval(fetchData, 3000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // If not logged in, show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {
      setIsAuthenticated(true);
      localStorage.setItem('balanceSenseAuth', 'true');
    }} />;
  }

  // Dashboard Loading State
  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Activity className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Dashboard Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Fetching Data</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  // Dashboard Data View
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Table Header Wrapper */}
        <div className="bg-gray-950 px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-200">Live Excel Data</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sync Active
            </div>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem('balanceSenseAuth');
              }}
              className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded border border-gray-800 hover:bg-gray-800 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-800">
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold text-right">Left Leg (kg)</th>
                <th className="px-6 py-4 font-semibold text-right">Right Leg (kg)</th>
                <th className="px-6 py-4 font-semibold text-right">Total (kg)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {data.map((row, index) => {
                const l = parseFloat(row.Left) || 0;
                const r = parseFloat(row.Right) || 0;
                const t = l + r;
                
                // Determine if there is an imbalance
                const leftPercentage = t > 0 ? (l / t) * 100 : 50;
                const rightPercentage = t > 0 ? (r / t) * 100 : 50;
                const difference = Math.abs(leftPercentage - rightPercentage);
                const isImbalanced = difference > 10;

                // Handle string status gracefully or default it
                const status = row.Status || (isImbalanced ? "Imbalance" : "Balanced");

                return (
                  <tr key={index} className="hover:bg-gray-800/40 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400 whitespace-nowrap">
                      {row.Time || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-blue-400">
                      {row.Left !== "" ? row.Left : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-emerald-400">
                      {row.Right !== "" ? row.Right : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-gray-200">
                      {row.Total !== "" ? row.Total : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${status.toLowerCase() === 'imbalance' || isImbalanced ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No data available in the spreadsheet yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
