import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, ThumbsDown, Mail, Calendar, MessageSquare, Search } from 'lucide-react';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8005/feedback')
      .then(res => {
        setFeedback(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredFeedback = feedback.filter(f => 
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.context && f.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans h-full flex flex-col">
       <div className="mb-8 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-black text-white tracking-tight">System Quality Feedback</h1>
             <p className="text-gray-400 mt-1 font-medium">Real-time reports from employees regarding AI accuracy and hallucinations.</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search reports or emails..." 
              className="w-full bg-brand-surface/80 border border-brand-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all font-bold shadow-inner placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
       </div>

       {loading ? (
         <div className="text-brand-primary font-bold animate-pulse">Syncing feedback logs...</div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedback.map(item => (
               <div key={item.id} className="glass-card backdrop-blur-xl rounded-3xl p-6 border border-brand-border/50/50 shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col h-full hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-2xl shadow-inner ${item.rating === 'ThumbsUp' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.rating === 'ThumbsUp' ? <ThumbsUp size={24}/> : <ThumbsDown size={24}/>}
                     </div>
                     <div className="text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.rating === 'ThumbsUp' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                           {item.rating === 'ThumbsUp' ? 'Accurate Response' : 'Hallucination Detected'}
                        </span>
                        <p className="text-[10px] text-gray-500 font-bold mt-2 flex items-center justify-end gap-1"><Calendar size={12}/> {new Date(item.timestamp).toLocaleString()}</p>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                     <p className="text-sm text-gray-400 font-medium mb-1 flex items-center gap-1.5"><Mail size={14} className="text-brand-primary"/> {item.email}</p>
                     <div className="bg-brand-bg/50 rounded-2xl p-4 mt-3 border border-brand-border/50/50 italic text-slate-200 font-medium relative shadow-inner">
                        <MessageSquare size={16} className="absolute -top-2 -left-2 text-slate-600 transform -rotate-12"/>
                        "{item.context || 'No specific comments provided.'}"
                     </div>
                  </div>
               </div>
            ))}
            {filteredFeedback.length === 0 && (
               <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-border/50/50 rounded-3xl glass-card backdrop-blur-xl">
                  <p className="text-gray-500 font-black italic">The quality log matrix is currently empty.</p>
               </div>
            )}
         </div>
       )}
    </div>
  );
}




