import React, { useState, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, FileText, Plus, MessageSquare, Mic, MicOff, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function EmployeeChatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    fetchSessions();
  }, []);

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
        sender: m.sender === 'user' ? 'user' : 'bot',
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
    setMessages(prev => [...prev, { text: query, sender: 'user' }]);
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
        docs: res.data.retrieved_chunks || res.data.documents
      }]);

      if (!sessionId) {
        setSessionId(res.data.session_id);
        fetchSessions();
      }
    } catch {
      setMessages(prev => [...prev, { text: "Network Error", sender: 'bot' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Sidebar for History */}
      <div className="w-72 border-r border-brand-border/50/50 bg-brand-bg flex flex-col shrink-0">
        <div className="p-4 border-b border-brand-border/50/50">
          <button onClick={newConversation} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all text-sm active:scale-95">
            <Plus size={16} /> New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-2 mt-2">Chat History</p>
          {sessions.map(s => (
            <div
              key={s.session_id}
              onClick={() => loadSession(s.session_id)}
              className={`w-full text-left flex items-start justify-between gap-3 px-3 py-3 rounded-xl transition-all text-sm group/item cursor-pointer ${s.session_id === sessionId ? 'bg-brand-primary/20 text-purple-100 shadow-sm border border-brand-primary/30' : 'hover:bg-brand-surface/50 text-gray-400 border border-transparent'}`}
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <MessageSquare size={16} className={`flex-shrink-0 mt-0.5 ${s.session_id === sessionId ? 'text-brand-primary' : 'text-gray-500'}`} />
                <div className="overflow-hidden">
                  <p className={`truncate font-bold ${s.session_id === sessionId ? 'text-brand-accent' : 'text-gray-200'}`}>{s.title}</p>
                  <p className={`text-[10px] font-medium mt-1 ${s.session_id === sessionId ? 'text-brand-primary' : 'text-gray-500'}`}>{new Date(s.updated_at).toLocaleDateString()}</p>
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
          {sessions.length === 0 && <p className="text-xs text-gray-500 italic px-2 font-medium">No past history.</p>}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden w-full z-0">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-6 w-full pb-40">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-full mb-6 shadow-inner">
                <Bot size={56} className="text-brand-primary" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-gray-200 mb-2">How can I assist you today?</p>
              <p className="font-medium text-gray-500">Your queries are bounded securely by your department.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 mt-1 border-2 ${msg.sender === 'user' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent border-brand-primary text-white' : 'bg-brand-surface border-brand-border/50 text-brand-primary'}`}>
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="flex flex-col gap-2">
                  <div className={`px-7 py-4 rounded-[2rem] shadow-xl ${msg.sender === 'user' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white rounded-tr-sm border border-brand-primary' : 'bg-brand-surface border border-brand-border/50 text-gray-200 rounded-tl-sm'}`}>
                    <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-brand-primary font-bold animate-pulse ml-16 text-sm">Validating context and generating response...</div>}
        </div>

        <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent z-10">
          <div className="w-full flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Search policies, compliance, or benefits..."
              className="flex-1 bg-brand-surface/80 text-white placeholder-slate-500 focus:bg-brand-surface border-2 border-brand-border/50 focus:border-brand-primary rounded-2xl px-6 py-4 focus:outline-none transition-all duration-300 font-bold shadow-inner"
            />
            <button
              onClick={startVoiceRecognition}
              className={`p-4 rounded-2xl transition-all shadow-lg flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-brand-surface border-2 border-brand-border/50 text-brand-primary hover:border-brand-primary shadow-brand-primary/10'}`}
              title="Neural Link Voice Query"
            >
              {isListening ? <MicOff size={24} className="text-white" /> : <Mic size={24} />}
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:bg-purple-500 text-white rounded-2xl p-4 shadow-lg shadow-brand-primary/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:bg-brand-surface disabled:text-gray-500 active:scale-95"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




