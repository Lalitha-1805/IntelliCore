import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8005/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('department', res.data.department);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('is_hr', res.data.is_hr);
      localStorage.setItem('email', email);
      
      if (res.data.is_hr) {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/home');
      }
    } catch (err) {
      setError('System authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans">
       <div className="w-full max-w-md">
          <div className="text-center mb-10">
             <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="text-white" size={28} />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter italic">Intelli<span className="text-brand-accent font-light">Core</span></span>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">Identity Verification</h1>
            <p className="text-gray-500 font-medium mt-1">Access your enterprise knowledge portal.</p>
          </div>

          <form onSubmit={handleLogin} className="glass-card p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent"></div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle size={16}/> {error}
              </div>
            )}
            
            <div className="space-y-4">
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="email" 
                    placeholder="Corporate Email" 
                    className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
               </div>

               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
               </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:from-brand-primary hover:to-brand-hover disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl neon-glow neon-glow-hover flex items-center justify-center gap-3">
              {isLoading ? 'Verifying Context...' : 'Authorize Login'} <ArrowRight size={20}/>
            </button>

            <div className="flex flex-col gap-3 pt-2 text-center">
              <p className="text-gray-400 text-xs font-bold">
                New to the platform? <Link to="/signup" className="text-brand-primary hover:text-brand-accent ml-1">Create Identity</Link>
              </p>
              <Link to="/" className="text-brand-border text-[10px] font-bold uppercase tracking-widest hover:text-brand-primary transition-colors mt-2">← Back to Overview</Link>
            </div>
          </form>

          <div className="mt-8 text-center">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Secured Infrastructure Node 74</p>
          </div>
       </div>
    </div>
  );
}




