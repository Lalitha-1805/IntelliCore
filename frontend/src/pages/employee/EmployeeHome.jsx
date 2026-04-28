import React from 'react';
import { Bot, Shield, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeHome() {
  const navigate = useNavigate();
  const department = localStorage.getItem('department') || 'Dept';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-gradient-to-br from-brand-surface to-brand-bg rounded-[2rem] p-10 text-white shadow-2xl neon-glow mb-8 relative overflow-hidden border border-brand-border/50">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-brand-primary/10 to-transparent"></div>
        <div className="absolute -right-20 -top-20 opacity-10">
           <Shield size={300} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 relative z-10">Welcome to your <br/>Knowledge Portal.</h1>
        <p className="text-brand-accent/80 text-lg max-w-lg mb-8 relative z-10 font-medium leading-relaxed">
          The Enterprise AI is tuned exclusively to your Role and Department constraints, guaranteeing 100% compliance and zero leakage.
        </p>
        <button 
          onClick={() => navigate('/employee/chatbot')}
          className="bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold py-3.5 px-8 rounded-2xl flex items-center gap-2 transition-all relative z-10 shadow-xl neon-glow neon-glow-hover hover:-translate-y-0.5"
        >
          <Bot size={20}/> Ask the AI Assistant <ArrowRight size={18}/>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-[2rem] shadow-xl hover:bg-brand-surface/60 transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
             <div className="w-12 h-12 bg-brand-primary/20 text-brand-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-brand-primary/30">
               <FileText size={24}/>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{department} Embedded Documents</h3>
             <p className="text-gray-400 font-medium leading-relaxed">Browse the specific guidelines and regulations mapped to your specific business unit.</p>
          </div>
         <div className="glass-card backdrop-blur-xl p-8 rounded-[2rem] border border-brand-border/50/50 shadow-xl flex items-center justify-center text-center">
            <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
               <h3 className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-2 mb-2">
                 <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div> Secure Connect
               </h3>
               <p className="text-gray-400 text-sm font-medium">All semantic queries strictly walled.</p>
            </div>
         </div>
      </div>
    </div>
  );
}




