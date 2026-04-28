import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, AlertCircle, Plus, MessageSquare, Mic, MicOff, Trash2 } from 'lucide-react';

export default function HRChatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    if (email) fetchSessions();
  }, [email]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`http://localhost:8005/chat/sessions?email=${email}`);
      setSessions(res.data);
    } catch (e) { }
  };

  const loadSession = async (id) => {
    setSessionId(id);
    try {
      const res = await axios.get(`http://localhost:8005/chat/sessions/${id}`);
      const formatted = res.data.messages.map(m => ({
        text: m.text,
        sender: m.sender === 'user' ? 'hr' : 'bot',
        tools: m.tools,
        docs: m.docs
      }));
      setMessages(formatted);
    } catch (e) {
      setMessages([]);
    }
  };

  const newConversation = () => {
    setSessionId(null);
    setMessages([]);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setQuery(transcript);
    };
    recognition.start();
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await axios.delete(`http://localhost:8005/chat/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.session_id !== id));
      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
      }
    } catch (e) {
      alert("Failed to delete session");
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    setMessages(prev => [...prev, { text: query, sender: 'hr' }]);
    setQuery('');
    setLoading(true);
    try {
      const payload = { email, query };
      if (sessionId) payload.session_id = sessionId;
      const res = await axios.post('http://localhost:8005/chat', payload);

      setMessages(prev => [...prev, {
        text: res.data.answer,
        sender: 'bot',
        tools: res.data.tools_used,
        docs: res.data.docs || res.data.retrieved_chunks
      }]);

      if (!sessionId) {
        setSessionId(res.data.session_id);
        fetchSessions();
      }
    } catch {
      setMessages(prev => [...prev, { text: "AI Pipeline Engine Offline.", sender: 'bot' }]);
    }
    setLoading(false);
  };

  const getDayLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const groupedSessions = sessions.reduce((acc, s) => {
    const label = getDayLabel(s.updated_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-full relative font-sans bg-brand-bg overflow-hidden">
      {/* Sidebar for History */}
      <div className="w-72 border-r border-brand-border/50/50 bg-brand-bg flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-brand-border/50/50">
          <button onClick={newConversation} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all text-sm active:scale-95">
            <Plus size={16} /> New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {Object.keys(groupedSessions).length === 0 ? (
            <p className="text-xs text-gray-500 italic px-2">No past history.</p>
          ) : (
            Object.entries(groupedSessions).map(([day, daySessions]) => (
              <div key={day} className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">{day}</p>
                {daySessions.map(s => (
                  <div
                    key={s.session_id}
                    onClick={() => loadSession(s.session_id)}
                    className={`w-full text-left flex items-start justify-between gap-3 px-3 py-3 rounded-xl transition-all text-sm group/item cursor-pointer ${s.session_id === sessionId ? 'bg-brand-primary/20 border border-brand-primary/30 shadow-sm' : 'hover:bg-brand-surface/50 border border-transparent'}`}
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <MessageSquare size={16} className={`flex-shrink-0 mt-0.5 ${s.session_id === sessionId ? 'text-brand-primary' : 'text-gray-500'}`} />
                      <div className="overflow-hidden">
                        <p className={`truncate font-bold ${s.session_id === sessionId ? 'text-purple-100' : 'text-gray-300'}`}>{s.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, s.session_id)}
                      className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-[1] flex flex-col relative w-full overflow-hidden z-0">
        <header className="px-8 py-6 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border/50/50 shrink-0 z-10">
          <h1 className="text-3xl font-black text-white tracking-tight">Cross-Department Analysis</h1>
          <p className="text-sm font-medium text-gray-400 mt-1">Query semantic embeddings across all divisions via the unrestricted HR token bounds.</p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-6 w-full pb-40">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <Bot size={56} className="text-brand-accent/50" />
              <p className="text-lg font-medium">Pipeline ready for global corporate synthesis.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'hr' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.sender === 'hr' ? 'flex-row-reverse' : 'flex-row'} items-end gap-4`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-gray-950 ${msg.sender === 'hr' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white' : 'bg-brand-surface text-brand-primary'}`}>
                  {msg.sender === 'hr' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`px-7 py-5 rounded-[2rem] shadow-xl ${msg.sender === 'hr' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white rounded-br-[4px] border border-brand-primary' : 'bg-brand-surface border border-brand-border/50 text-gray-200 rounded-bl-[4px]'}`}>
                  <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
                  {msg.docs && msg.docs.length > 0 && (
                    <div className="mt-4 border-t border-brand-border/50/50 pt-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertCircle size={12} /> Cross-Department Traces</p>
                      <div className="flex gap-2 flex-wrap">
                        {msg.docs.map((d, idx) => {
                          const isString = typeof d === 'string';
                          const dept = isString ? "General" : (d.department || "General");
                          const content = isString ? d : (d.doc_id || d.title || JSON.stringify(d));
                          const displayText = content.length > 50 ? content.substring(0, 50).replace(/\n/g, ' ') + '...' : content.replace(/\n/g, ' ');
                          return (
                            <span key={idx} className="text-xs bg-brand-bg border border-brand-border/50 px-3 py-1.5 rounded-lg font-mono text-gray-400 shadow-inner max-w-full truncate" title={content}>
                              {dept}: {displayText}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {msg.tools && msg.tools.length > 0 && <div className="mt-3 text-[10px] text-brand-primary font-mono font-bold bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded inline-block">MCP: {msg.tools.join(" → ")}</div>}
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-brand-primary font-medium animate-pulse ml-14">Executing System Toolchain...</div>}
        </div>

        <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent z-10">
          <div className="w-full flex gap-4">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask the unified knowledge base..." className="flex-1 bg-brand-surface/80 text-white placeholder-gray-500 focus:bg-brand-surface border-2 border-brand-border/50 focus:border-brand-primary rounded-2xl px-6 py-4 focus:outline-none transition-all duration-300 font-medium shadow-inner" />
            <button
              onClick={startVoiceRecognition}
              className={`p-4 rounded-2xl transition-all shadow-lg flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-brand-surface border-2 border-brand-border/50 text-brand-primary hover:border-brand-primary shadow-brand-primary/10'}`}
              title="Neural Link Voice Query"
            >
              {isListening ? <MicOff size={24} className="text-white" /> : <Mic size={24} />}
            </button>
            <button onClick={handleSend} disabled={loading || !query.trim()} className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 disabled:opacity-50 disabled:bg-brand-surface disabled:text-gray-500 text-white rounded-2xl p-4 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"><Send size={24} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
