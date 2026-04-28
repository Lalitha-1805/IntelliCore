import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertOctagon, CheckCircle2, Upload, X, FileText } from 'lucide-react';

export default function PolicyGap() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGap, setActiveGap] = useState(null); // Gap being resolved
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchGaps();
  }, []);

  const fetchGaps = async () => {
    try {
      const res = await axios.get('http://localhost:8005/gaps');
      setGaps(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleResolution = async () => {
    if (!file || !activeGap) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Ingest the document
      await axios.post('http://localhost:8005/documents/upload', formData);
      // 2. Resolve the gap
      await axios.delete(`http://localhost:8005/gaps/${activeGap.id}`);
      
      // Cleanup
      setActiveGap(null);
      setFile(null);
      fetchGaps();
    } catch (err) {
      alert("Resolution sequence failed.");
    }
    setUploadLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">AI Policy Gap Detection</h1>
          <p className="text-gray-400 mt-1 font-medium">Automatic monitoring of queries that the system could not answer from available documents.</p>
       </div>

       {/* Resolution Modal */}
       {activeGap && (
         <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-brand-surface rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-brand-border/50 animate-in zoom-in-95">
               <button onClick={() => setActiveGap(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
               <h2 className="text-2xl font-black text-white mb-2">Resolve Policy Gap</h2>
               <p className="text-sm text-gray-400 mb-6 font-medium">Upload context to address: <br/><span className="text-brand-primary font-bold italic">"{activeGap.query}"</span></p>
               
               <div className="space-y-6">
                   <div className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center bg-brand-bg/50 hover:bg-brand-bg transition-colors cursor-pointer group relative overflow-hidden">
                     <input 
                       type="file" 
                       onChange={e => setFile(e.target.files[0])} 
                       className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full" 
                     />
                     <div className="flex flex-col items-center relative z-10 pointer-events-none">
                        <FileText className={`mb-3 ${file ? 'text-brand-primary animate-bounce' : 'text-gray-500'}`} size={32}/>
                        <p className="text-sm font-bold text-slate-200">{file ? file.name : "Select Compliance Doc"}</p>
                     </div>
                   </div>
                  
                  <button 
                     onClick={handleResolution} 
                     disabled={!file || uploadLoading} 
                     className="w-full py-4 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? "Vectorizing Context..." : "Resolve & Ingest"} {!uploadLoading && <Upload size={18}/>}
                  </button>
               </div>
            </div>
         </div>
       )}

       {loading ? (
         <div className="text-brand-primary font-bold animate-pulse">Scanning knowledge vectors...</div>
       ) : gaps.length > 0 ? (
         <div className="space-y-4">
            {gaps.map((gap, i) => (
               <div key={gap.id || i} className="p-6 rounded-2xl border flex items-center justify-between shadow-lg bg-orange-500/10 border-orange-500/30 animate-in slide-in-from-top-2 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                     <AlertOctagon className="text-orange-400" size={28}/>
                     <div>
                       <h3 className="font-bold text-lg text-orange-400">Query: "{gap.query}"</h3>
                       <p className="text-sm mt-1 font-medium text-orange-300/80">Flagged on {new Date(gap.timestamp).toLocaleString()}. Source: {gap.department}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setActiveGap(gap)}
                    className="bg-brand-surface border border-slate-600 rounded-xl px-5 py-2.5 font-bold text-gray-200 hover:bg-slate-700 hover:text-white shadow-sm transition-all text-sm"
                  >
                    Upload Context
                  </button>
               </div>
            ))}
         </div>
       ) : (
         <div className="p-12 rounded-3xl border-2 border-dashed border-brand-border/50/50 glass-card backdrop-blur-xl flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <CheckCircle2 size={32}/>
             </div>
             <h3 className="text-xl font-bold text-white">Knowledge Base Intact</h3>
             <p className="text-gray-400 mt-2 max-w-md">No policy gaps detected in recent employee interactions. All queries are successfully routing to source documents.</p>
         </div>
       )}
    </div>
  );
}




