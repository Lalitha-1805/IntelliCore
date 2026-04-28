import React, { useState } from 'react';
import axios from 'axios';
import { Send, User, Bot, AlertCircle, LogOut } from 'lucide-react';

export default function EmployeeDashboard() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const email = localStorage.getItem('email');
  const department = localStorage.getItem('department');
  const role = localStorage.getItem('role');

  const handleSend = async () => {
    if (!query.trim()) return;
    const newMsg = { text: query, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
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
      setMessages(prev => [...prev, { text: "Network error processing request.", sender: 'bot' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col font-sans">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">IntelliCore<span className="font-light text-brand-primary mx-1">/</span>Employee</h1>
        <div className="flex items-center space-x-3 text-sm">
          <span className="px-3 py-1.5 bg-blue-100/50 text-blue-700 rounded-lg font-bold uppercase tracking-wider text-xs border border-blue-200">{department}</span>
          <span className="px-3 py-1.5 bg-green-100/50 text-green-700 rounded-lg font-bold uppercase tracking-wider text-xs border border-green-200">{role}</span>
          <button className="text-gray-500 hover:text-red-600 ml-4 transition-colors font-medium cursor-pointer p-2 rounded-lg hover:bg-red-50 flex items-center" onClick={() => window.location.href='/login'}><LogOut size={18}/></button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6 max-w-4xl mx-auto w-full pb-32">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-5 animate-pulse">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center rotated-bg shadow-inner">
               <Bot size={40} className="text-brand-accent" />
            </div>
            <p className="text-xl font-medium tracking-tight text-gray-500">Ask a question regarding internal policies...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 translate-y-0 opacity-100 transition-all duration-300`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md flex-shrink-0 border-2 ${msg.sender === 'user' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent border-indigo-200' : 'bg-white border-gray-200'}`}>
                {msg.sender === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-indigo-600" />}
              </div>
              <div className={`px-6 py-4 rounded-3xl shadow-sm relative ${msg.sender === 'user' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white rounded-br-sm' : 'bg-white border border-gray-200/60 text-gray-800 rounded-bl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                {msg.docs && msg.docs.length > 0 && (
                  <div className="mt-4 border-t border-gray-100/50 pt-3 flex flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 w-full mb-1"><AlertCircle size={14}/> Retrieved Evidence</span>
                    {msg.docs.map((d, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200/50 font-mono shadow-sm">{d.doc_id}</span>
                    ))}
                  </div>
                )}
                {msg.tools && (
                  <div className="mt-3 text-[11px] text-brand-primary/80 font-mono flex items-center gap-2">
                    <span className="font-bold tracking-widest">MCP PIPELINE:</span> {msg.tools.join(" → ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200/60 text-gray-500 px-6 py-5 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
                 <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                 <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
               </div>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 p-5 fixed bottom-0 w-full left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto flex gap-4 relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 focus:bg-white border-2 border-transparent focus:border-brand-primary rounded-2xl px-6 py-4 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-indigo-700 active:scale-95 text-white rounded-2xl p-4 disabled:opacity-50 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center justify-center min-w-[60px]"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}




