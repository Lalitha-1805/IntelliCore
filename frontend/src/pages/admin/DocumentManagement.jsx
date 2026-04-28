import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Edit3, X } from 'lucide-react';
import axios from 'axios';

export default function DocumentManagement() {
  const [docs, setDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await axios.get('http://localhost:8005/documents');
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDoc = async (id) => {
    await axios.delete(`http://localhost:8005/documents/${id}`);
    fetchDocs();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://localhost:8005/documents/upload', formData);
      setShowModal(false);
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert("Upload failed. Ensure backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Knowledge</h1>
          <p className="text-gray-400 mt-1 font-medium italic">Manage the global intelligence corpus for all employees.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-primary/30 transition-all active:scale-95">
          <Upload size={18} /> Ingest File
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-brand-surface rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-brand-border/50 animate-in zoom-in-95 fade-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
            <h2 className="text-2xl font-black text-white mb-6">Internal Knowledge Ingestion</h2>
            <div className="space-y-6">
               <div className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center bg-brand-bg/50 hover:bg-brand-bg transition-colors cursor-pointer group relative overflow-hidden">
                 <input 
                   type="file" 
                   onChange={e => setFile(e.target.files[0])} 
                   className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full" 
                 />
                 <div className="flex flex-col items-center relative z-10 pointer-events-none">
                    <div className="w-12 h-12 bg-brand-surface rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-brand-primary" size={24}/>
                    </div>
                    <p className="text-sm font-bold text-slate-200">
                      {file ? file.name : "Select Document (PDF/DOCX)"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 50MB</p>
                 </div>
               </div>
               
               <button 
                  onClick={handleUpload} 
                  disabled={!file || loading} 
                  className="w-full py-4 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 active:scale-95"
               >
                 {loading ? "Compressing Vectors..." : "Commit to Knowledge Base"}
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card backdrop-blur-xl rounded-3xl shadow-xl border border-brand-border/50/50 overflow-auto flex-1">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-brand-surface/80 text-gray-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-brand-border/50/50">
            <tr>
              <th className="px-6 py-5">Document Instance</th>
              <th className="px-6 py-5">Ingestion Timestamp</th>
              <th className="px-6 py-5 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-6 py-5 font-bold text-slate-200 flex items-center gap-3">
                  <div className="bg-slate-700 text-gray-400 p-2 rounded-xl group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-colors"><FileText size={18}/></div>
                  {doc.name}
                </td>
                <td className="px-6 py-5 font-mono text-xs text-gray-500">
                  {new Date(doc.date).toLocaleString()}
                </td>
                <td className="px-6 py-5 flex items-center justify-end gap-2">
                  <button onClick={() => deleteDoc(doc.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-20 text-center">
                   <p className="text-gray-500 font-bold italic">No internal knowledge ingested. Use "Ingest File" to begin.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




