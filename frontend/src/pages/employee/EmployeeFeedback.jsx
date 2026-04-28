import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function EmployeeFeedback() {
  const [context, setContext] = useState('');
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const email = localStorage.getItem('email');

  const handleSubmit = async () => {
    if (!rating) return;
    try {
      await axios.post('http://localhost:8005/feedback', { email, rating, context });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setContext('');
        setRating(null);
      }, 3000);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
         <h1 className="text-3xl font-black text-white tracking-tight">System Feedback</h1>
         <p className="text-gray-400 mt-2 font-medium">Help us train the enterprise semantic retrieval engine.</p>
      </div>
      <div className="glass-card backdrop-blur-xl rounded-[2rem] border border-brand-border/50/50 shadow-2xl p-8">
         <div className="mb-8 flex justify-center gap-6">
            <button onClick={() => setRating('ThumbsUp')} className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border ${rating === 'ThumbsUp' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30 shadow-inner shadow-emerald-500/20' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent hover:border-emerald-500/20'}`}>
               <ThumbsUp size={48} />
               <span className="font-bold text-sm uppercase tracking-wider">Accurate Answers</span>
            </button>
            <button onClick={() => setRating('ThumbsDown')} className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border ${rating === 'ThumbsDown' ? 'text-red-400 bg-red-500/20 border-red-500/30 shadow-inner shadow-red-500/20' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/20'}`}>
               <ThumbsDown size={48} />
               <span className="font-bold text-sm uppercase tracking-wider">Hallucinations</span>
            </button>
         </div>
         {submitted ? (
            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-6 rounded-2xl flex items-center gap-4 mt-6 shadow-inner"><CheckCircle className="text-emerald-400"/> Thank you! Your feedback has been secured into the QueryLog matrix.</div>
         ) : (
         <div>
            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Additional Context (Optional)</label>
            <textarea 
              rows="4" 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full border-2 border-brand-border/50 rounded-2xl p-4 bg-brand-bg/50 focus:bg-brand-bg focus:outline-none focus:border-brand-primary transition-colors font-medium text-white placeholder-slate-500 shadow-inner"
              placeholder="Did the bot miss a document you know exists?"
            ></textarea>
            <button onClick={handleSubmit} disabled={!rating} className="w-full bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 disabled:opacity-50 disabled:bg-brand-surface disabled:text-gray-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95">
               <MessageSquare size={18} /> Submit Feedback Log
            </button>
         </div>
         )}
      </div>
    </div>
  );
}




