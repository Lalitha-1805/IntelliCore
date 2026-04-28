import React, { useState } from 'react';
import axios from 'axios';
import { Send, User, Bot, Upload, BarChart2, Shield, AlertCircle, FileText, LogOut } from 'lucide-react';

export default function HRDashboard() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const email = localStorage.getItem('email');
  
  const handleSend = async () => {
    if (!query.trim()) return;
    setMessages(prev => [...prev, { text: query, sender: 'hr' }]);
    setQuery('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/chat', { email, query });
      setMessages(prev => [...prev, { 
        text: res.data.answer, 
        sender: 'bot',
        tools: res.data.tools_used,
        docs: res.data.documents 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "System error.", sender: 'bot' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-bg text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold tracking-wider uppercase text-slate-100">Genesis</h2>
              <p className="text-xs text-brand-primary font-mono tracking-widest mt-1">AX-HR ADMIN</p>
           </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-brand-surface hover:text-white'}`}
          >
            <Bot size={20} /> <span className="font-semibold">Cross-Dept AI</span>
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-brand-surface hover:text-white'}`}
          >
            <Upload size={20} /> <span className="font-semibold">Knowledge Ingest</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-brand-surface hover:text-white'}`}
          >
            <BarChart2 size={20} /> <span className="font-semibold">Insights</span>
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'access' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-brand-surface hover:text-white'}`}
          >
            <Shield size={20} /> <span className="font-semibold">Access Control</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={()=>window.location.href='/login'} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 transition-colors p-2 font-medium">
             <LogOut size={16}/> Logout Default
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
        {activeTab === 'chat' && (
          <>
            <header className="bg-white/80 backdrop-blur-md px-8 py-5 flex items-center justify-between shadow-sm border-b border-gray-200 z-10">
               <div>
                 <h1 className="text-2xl font-black text-gray-900">Enterprise AI Synthesis</h1>
                 <p className="text-sm font-medium text-gray-500 mt-1">Cross-departamental analytics and queries unrestricted by role.</p>
               </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-6 max-w-5xl mx-auto w-full pb-32">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <Bot size={64} className="text-brand-accent mb-6" />
                  <p className="text-xl font-medium">Run cross-department analysis pipelines.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'hr' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.sender === 'hr' ? 'flex-row-reverse' : 'flex-row'} items-end gap-4`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${msg.sender === 'hr' ? 'bg-brand-surface' : 'bg-white border-2 border-indigo-100'}`}>
                      {msg.sender === 'hr' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-600" />}
                    </div>
                    <div className={`px-7 py-5 rounded-3xl shadow-sm ${msg.sender === 'hr' ? 'bg-brand-surface text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                      
                      {msg.docs && msg.docs.length > 0 && (
                        <div className="mt-5 border-t border-gray-100 pt-4">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2"><AlertCircle size={14} className="text-brand-primary"/> Retrieved Contexts Across Departments</span>
                          <div className="grid grid-cols-2 gap-2">
                             {msg.docs.map((d, i) => (
                               <div key={i} className="text-xs bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 font-mono flex items-center justify-between">
                                 <span className="truncate w-3/5">{d.doc_id}</span>
                                 <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] w-2/5 text-center">{d.department} | {d.role_access}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      {msg.tools && (
                        <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">MCP Pipeline:</span> 
                          <span className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">{msg.tools.join(" → ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-200 px-6 py-5 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-3">
                     <Bot size={18} className="text-brand-primary animate-pulse"/>
                     <span className="text-sm font-semibold text-gray-400 tracking-wide">Executing MCP Pipeline...</span>
                   </div>
                </div>
              )}
            </div>
            <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-6 absolute bottom-0 w-full z-20">
              <div className="max-w-5xl mx-auto flex gap-4">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="e.g. 'Synthesize reimbursement policies across IT and Finance...'"
                  className="flex-1 bg-white border-2 border-slate-200 focus:border-brand-primary rounded-2xl px-6 py-4 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !query.trim()}
                  className="bg-brand-bg hover:bg-brand-surface active:scale-95 text-white rounded-2xl p-4 disabled:opacity-50 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-200 flex items-center justify-center min-w-[64px]"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="p-12 h-full overflow-auto">
             <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-10 mt-10">
                 <div className="flex items-center gap-4 mb-10">
                   <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Upload size={32}/>
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-slate-800">Knowledge Ingestion Engine</h2>
                     <p className="text-gray-500 mt-2 font-medium">Embed documents into ChromaDB with strict metadata boundaries.</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors cursor-pointer group">
                       <FileText size={48} className="text-gray-400 group-hover:text-brand-primary mb-4 transition-colors" />
                       <p className="text-lg font-bold text-slate-700">Drag & Drop Documents</p>
                       <p className="text-sm text-gray-500 mt-2 font-medium">Supported formats: PDF, TXT, DOCX</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider text-[11px]">Strict Department Access</label>
                         <select className="w-full border-2 border-slate-200 p-3.5 rounded-xl font-medium focus:outline-none focus:border-brand-primary bg-white">
                           <option>All Departments</option>
                           <option>HR</option>
                           <option>Finance</option>
                           <option>IT</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider text-[11px]">Role Scope</label>
                         <select className="w-full border-2 border-slate-200 p-3.5 rounded-xl font-medium focus:outline-none focus:border-brand-primary bg-white">
                           <option>Both (All Roles)</option>
                           <option>Full-time Only</option>
                           <option>Intern Only</option>
                         </select>
                       </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2">
                       <Upload size={20}/> Execute Vector Embedding
                    </button>
                 </div>
             </div>
          </div>
        )}

        {/* Analytics Mock Tab */}
        {activeTab === 'analytics' && (
           <div className="p-12 h-full flex flex-col items-center justify-center">
              <BarChart2 size={64} className="text-gray-200 mb-6"/>
              <h2 className="text-2xl font-bold text-gray-400">Analytics Dashboard Coming Soon</h2>
           </div>
        )}
        
        {/* Access Mock Tab */}
        {activeTab === 'access' && (
           <div className="p-12 h-full flex flex-col items-center justify-center">
              <Shield size={64} className="text-gray-200 mb-6"/>
              <h2 className="text-2xl font-bold text-gray-400">Access Control Management Coming Soon</h2>
           </div>
        )}
      </main>
    </div>
  );
}




