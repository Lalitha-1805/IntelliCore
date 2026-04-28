import React, { useState, useEffect } from 'react';
import { Activity, Terminal } from 'lucide-react';
import axios from 'axios';

export default function LogsActivity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8005/logs').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans h-full">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Audit Logs</h1>
          <p className="text-gray-500 mt-1 font-medium">Trace every pipeline execution and context retrieval operation.</p>
       </div>
       <div className="bg-brand-bg rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-gray-200 font-mono text-sm leading-relaxed">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3 text-gray-400">
             <Terminal size={18}/>
             <span>var/log/mcp_pipelines.log</span>
          </div>
          <div className="p-6">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-gray-500 border-b border-slate-800">
                   <th className="pb-3 font-normal">Timestamp</th>
                   <th className="pb-3 font-normal">User Matrix</th>
                   <th className="pb-3 font-normal">Action Trigger</th>
                   <th className="pb-3 font-normal">MCP Pipeline Trace</th>
                   <th className="pb-3 font-normal">Exit Code</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {logs.map((log, i) => (
                   <tr key={i} className="hover:bg-brand-surface/30 transition-colors">
                     <td className="py-4 text-emerald-500">{log.time}</td>
                     <td className="py-4 text-blue-400">{log.user}</td>
                     <td className="py-4">{log.action}</td>
                     <td className="py-4 text-brand-primary">{log.tools}</td>
                     <td className={`py-4 ${log.status.includes('Success') ? 'text-emerald-500' : 'text-red-400'}`}>[{log.status}]</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}




