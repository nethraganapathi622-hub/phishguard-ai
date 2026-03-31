import React, { useState } from 'react';
import { Shield, Mail, Globe, LayoutDashboard, Search, AlertTriangle, CheckCircle, ShieldAlert, History, Activity } from 'lucide-react';

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center space-x-3 p-4 cursor-pointer transition-all rounded-lg mb-2 ${
      active ? 'bg-cyan-500/20 text-cyan-400 border-r-4 border-cyan-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  </div>
);

// --- Main Application ---

export default function PhishGuardApp() {
  const [activeTab, setActiveTab] = useState('landing');
  const [emailContent, setEmailContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);

const handleScan = async (type) => {

  setIsScanning(true);

  try {

    let response;
    let data;

    // EMAIL SCAN
    if(type === "email"){

      response = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: emailContent
        })
      });

      data = await response.json();

      const confidenceScore = Math.round((data.confidence || 0) * 100);

      setResults({
        type: "email",
        risk: data.result === "Phishing Detected" ? "High" : "Low",
        score: confidenceScore,
        indicators: data.result === "Phishing Detected"
          ? [
              "Suspicious Language Pattern",
              "ML Model Detected Phishing Traits",
              "Potential Social Engineering Attempt"
            ]
          : [
              "Content appears legitimate",
              "No phishing indicators detected",
              "Sender pattern looks normal"
            ]
      });

    }

    // URL SCAN
    if(type === "url"){

      response = await fetch(
        "http://127.0.0.1:8000/scan-url?url=" + encodeURIComponent(urlInput),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      data = await response.json();

      const confidenceScore = Math.round((data.confidence || 0) * 100);

      setResults({
        type: "url",
        risk: data.result === "Malicious URL" ? "High" : "Low",
        score: confidenceScore,
        indicators: data.result === "Malicious URL"
          ? [
              "Suspicious domain detected",
              "AI model flagged potential phishing",
              "Possible malicious redirect"
            ]
          : [
              "Domain appears safe",
              "No phishing patterns detected",
              "URL structure looks legitimate"
            ]
      });

    }

  } catch (error) {
    console.error("Scan error:", error);
  }

  setIsScanning(false);
};

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 flex font-sans">
      
      {/* Sidebar - Desktop */}
      <nav className="w-64 border-r border-slate-800 flex flex-col p-4 hidden md:flex">
        <div className="flex items-center space-x-2 px-4 py-8">
          <Shield className="text-cyan-500" size={32} />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-500 bg-clip-text text-transparent">
            PhishGuard AI
          </span>
        </div>
        
        <div className="mt-10 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Mail} label="Email Scanner" active={activeTab === 'email'} onClick={() => setActiveTab('email')} />
          <SidebarItem icon={Globe} label="URL Scanner" active={activeTab === 'url'} onClick={() => setActiveTab('url')} />
        </div>

        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-cyan-500 mb-2">
            <Activity size={14} /> <span>System Status: Optimal</span>
          </div>
          <p className="text-[10px] text-slate-500 italic font-mono uppercase tracking-widest">AI Engine v4.2.0</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Landing Page */}
        {activeTab === 'landing' && (
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
            <div className="z-10 max-w-4xl">
              <div className="inline-block px-4 py-1 border border-cyan-500/30 rounded-full bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-6">
                Next-Gen Cybersecurity Powered by Neural Networks
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                AI-Powered <span className="text-cyan-500">Phishing Detection</span> System
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Protect your digital identity. PhishGuard AI uses advanced machine learning to identify malicious emails and URLs before they can harm you.
              </p>
              <div className="flex space-x-4 justify-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1e] px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  Start Scanning Now
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all">
                  How it Works
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Security Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard label="Total Scans" value="12,842" icon={Search} color="bg-blue-500" />
              <StatCard label="Threats Blocked" value="431" icon={ShieldAlert} color="bg-red-500" />
              <StatCard label="System Integrity" value="99.9%" icon={CheckCircle} color="bg-emerald-500" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><History size={18} /> Recent Scan History</h3>
                <button className="text-cyan-500 text-sm hover:underline">View All</button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4">Target</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Result</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    { target: 'login-update-bank.com', type: 'URL', status: 'Malicious', date: '2 mins ago' },
                    { target: 'Internal Payroll Update', type: 'Email', status: 'Safe', date: '1 hour ago' },
                    { target: 'amazon-security-alert.net', type: 'URL', status: 'Suspicious', date: '5 hours ago' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-mono text-sm">{row.target}</td>
                      <td className="p-4 text-slate-400">{row.type}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          row.status === 'Malicious' ? 'bg-red-500/10 text-red-500' : 
                          row.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email Scanner */}
        {activeTab === 'email' && (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-3xl font-bold text-white mb-2">AI Email Analyzer</h2>
            <p className="text-slate-400 mb-8">Paste the full header and content of the email to detect phishing attempts.</p>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
              <textarea 
                className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm"
                placeholder="Paste email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <button 
                onClick={() => handleScan('email')}
                disabled={isScanning || !emailContent}
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-[#0a0f1e] py-4 rounded-lg font-bold flex justify-center items-center gap-2 transition-all"
              >
                {isScanning ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a0f1e]"></div>
                ) : (
                  <><Search size={20} /> Analyze Email</>
                )}
              </button>
            </div>

            {results && results.type === 'email' && !isScanning && (
              <ResultSection results={results} />
            )}
          </div>
        )}

        {/* URL Scanner */}
        {activeTab === 'url' && (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Malicious URL Detector</h2>
            <p className="text-slate-400 mb-8">Enter a suspicious website link to analyze its risk score and security status.</p>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
              <div className="flex gap-4">
                <input 
                  type="text"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://example-site.com/verify-login"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button 
                  onClick={() => handleScan('url')}
                  disabled={isScanning || !urlInput}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-[#0a0f1e] px-8 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                  {isScanning ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a0f1e]"></div>
                  ) : 'Scan URL'}
                </button>
              </div>
            </div>

            {results && results.type === 'url' && !isScanning && (
              <ResultSection results={results} />
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// Result Display Component
function ResultSection({ results }) {
  const isHighRisk = results.risk === 'High';
  return (
    <div className={`mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className={`border-l-4 p-6 rounded-r-xl bg-slate-900 ${isHighRisk ? 'border-red-500' : 'border-emerald-500'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm uppercase tracking-widest text-slate-500 font-bold">Analysis Result</span>
            <h3 className={`text-2xl font-bold ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>
              Threat Level: {results.risk} Risk
            </h3>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-white">{results.score}%</span>
            <p className="text-xs text-slate-500 uppercase">Risk Score</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-cyan-500" /> Detected Indicators:
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.indicators.map((ind, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}`} />
                {ind}
              </li>
            ))}
          </ul>
        </div>

        <div className={`mt-8 p-4 rounded-lg flex items-center gap-4 ${isHighRisk ? 'bg-red-500/10 text-red-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
          <ShieldAlert size={24} />
          <div>
            <p className="font-bold">Recommendation</p>
            <p className="text-sm opacity-80">
              {isHighRisk ? 'Do not click any links or download attachments. Block the sender immediately.' : 'This appears to be safe based on our current AI model parameters.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
