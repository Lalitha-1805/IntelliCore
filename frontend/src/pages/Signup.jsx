import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, UserCircle, ArrowRight, Shield, Phone, MapPin, Users } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    phone: '',
    gender: 'Other',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8005/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/30 mx-auto mb-6">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-gray-400 font-medium italic">Define your identity in the knowledge network.</p>
        </div>

        <form onSubmit={handleSignup} className="glass-card p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent"></div>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold animate-shake">{error}</div>}
          
          <div className="space-y-4">
             <div className="flex bg-brand-bg p-1 rounded-2xl border border-brand-border/50 mb-6">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: 'Employee'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${formData.role === 'Employee' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Employee
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: 'Admin'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${formData.role === 'Admin' ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Admin / HR
                </button>
             </div>

             <div className="relative">
               <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 required
               />
             </div>

             <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="email" 
                  placeholder="Corp Email" 
                  className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                 required
               />
             </div>

             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <input 
                   type="password" 
                   placeholder="Password" 
                   className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <input 
                   type="tel" 
                   placeholder="Phone Number" 
                   className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <select 
                   className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  value={formData.gender}
                  required
                >
                  <option value="Male" className="bg-brand-bg">Male</option>
                  <option value="Female" className="bg-brand-bg">Female</option>
                  <option value="Other" className="bg-brand-bg">Other</option>
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-500" size={20} />
                 <textarea 
                   placeholder="Mailing Address" 
                   className="w-full bg-brand-bg/50 border border-brand-border/30 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500 min-h-[100px] resize-none"
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent hover:from-brand-primary hover:to-brand-hover disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl neon-glow neon-glow-hover flex items-center justify-center gap-3"
          >
            {loading ? 'Initializing...' : `Register as ${formData.role}`} <ArrowRight size={20}/>
          </button>

          <p className="text-center text-gray-400 text-xs font-bold">
            Existing Identity? <Link to="/login" className="text-brand-primary hover:text-brand-accent ml-1">Access Portal</Link>
          </p>
        </form>
      </div>
    </div>
  );
}




