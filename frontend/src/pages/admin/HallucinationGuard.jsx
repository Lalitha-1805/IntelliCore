import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Zap, History, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function HallucinationGuard() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ hallucination_rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logRes, metricRes] = await Promise.all([
        axios.get('http://localhost:8005/analytics/hallucinations'),
        axios.get('http://localhost:8005/analytics/metrics')
      ]);
      setLogs(logRes.data);
      setMetrics(metricRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans text-white">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={40}/>
            Hallucination Guard
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">
            Real-time self-correction monitoring and groundedness verification.
          </p>
        </div>
        <div className="bg-brand-surface border border-brand-border/50 p-6 rounded-3xl shadow-2xl text-center min-w-[200px]">
          <p className="text-xs font-black uppercase tracking-widest text-brand-primary mb-1">Current Hallucination Rate</p>
          <div className="text-4xl font-black text-emerald-400">
            {metrics.hallucination_rate?.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-2 font-bold">Successfully Self-Corrected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-brand-surface to-brand-bg p-8 rounded-3xl border border-brand-border/30">
          <Zap className="text-brand-primary mb-4" size={32}/>
          <h3 className="text-xl font-bold mb-2">Automated Traces</h3>
          <p className="text-sm text-gray-400 leading-relaxed">The system automatically detects ungrounded claims and re-runs the logic with corrective prompts.</p>
        </div>
        <div className="bg-gradient-to-br from-brand-surface to-brand-bg p-8 rounded-3xl border border-brand-border/30">
          <History className="text-blue-400 mb-4" size={32}/>
          <h3 className="text-xl font-bold mb-2">Correction History</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Audit the difference between hallucinated attempts and finalized grounded answers.</p>
        </div>
        <div className="bg-gradient-to-br from-brand-surface to-brand-bg p-8 rounded-3xl border border-brand-border/30">
          <ShieldAlert className="text-orange-400 mb-4" size={32}/>
          <h3 className="text-xl font-bold mb-2">Zero-Trust Layer</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Every response is cross-referenced against original source vectors before reaching the user.</p>
        </div>
      </div>

      <div className="bg-brand-surface/50 backdrop-blur-xl rounded-3xl border border-brand-border/50 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-brand-border/50 bg-brand-surface flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-2">
            <History size={20} className="text-brand-primary"/>
            Self-Correction Audit Log
          </h2>
          <button onClick={fetchData} className="text-xs font-black text-brand-primary hover:text-white transition-colors">REFRESH LOGS</button>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="p-20 text-center text-gray-500 font-bold animate-pulse">Analyzing neural traces...</div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <CheckCircle2 size={64} className="text-emerald-500/20 mb-4"/>
              <h3 className="text-xl font-bold text-gray-400">No Hallucinations Detected</h3>
              <p className="text-sm text-gray-500 mt-1">The Agentic RAG system is maintaining 100% groundedness.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-bg/50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-brand-border/50">
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">User Query</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Retries</th>
                  <th className="px-8 py-4">Corrected Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30">
                {logs.map((log, i) => (
                  <tr key={log._id || i} className="hover:bg-brand-primary/5 transition-colors group">
                    <td className="px-8 py-6 text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-8 py-6 font-bold text-sm italic text-gray-300">"{log.query}"</td>
                    <td className="px-8 py-6">
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                        <CheckCircle2 size={12}/> SELF-CORRECTED
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1">
                        {[...Array(log.retries)].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs overflow-hidden">
                       <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{log.corrected_answer}</p>
                       <button className="text-[10px] font-black text-brand-primary mt-2 group-hover:underline">VIEW FULL TRACE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
