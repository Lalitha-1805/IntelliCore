import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Home, Bell, Settings, MessageSquare, LogOut, Shield } from 'lucide-react';
import axios from 'axios';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    if (email) {
      axios.get(`http://localhost:8005/users/me?email=${email}`)
        .then(res => setUser(res.data))
        .catch(() => {});
    }
  }, [email, location.pathname]); // Refresh on navigation to see profile changes

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-brand-bg font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-brand-surface/40 backdrop-blur-xl border-r border-brand-border/50 flex flex-col shadow-2xl z-20 relative">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-brand-border via-brand-primary/50 to-brand-border"></div>
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="bg-gradient-to-br from-brand-primary to-brand-accent p-2.5 rounded-2xl shadow-lg shadow-brand-primary/30 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={24} />
             </div>
             <div>
                <span className="text-xl font-black text-white tracking-tighter italic block leading-none">Intelli<span className="text-brand-accent font-light italic">Core</span></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 block">Employee Portal</span>
             </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { icon: Home, label: 'Portal Home', path: '/employee/home' },
              { icon: Bot, label: 'Employee AI Chat', path: '/employee/chatbot' },
              { icon: Bell, label: 'Alerts', path: '/employee/alerts' },
              { icon: MessageSquare, label: 'Support & Feedback', path: '/employee/feedback' },
              { icon: Settings, label: 'Profile Settings', path: '/employee/settings' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                   to={item.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all border ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-border/80 to-brand-primary border-brand-primary text-white shadow-lg neon-glow' 
                      : 'text-gray-400 border-transparent hover:bg-brand-surface/50 hover:text-white hover:border-brand-border/30'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-brand-border/50 space-y-4 bg-brand-surface/30">
          <div className="bg-brand-bg/50 p-4 rounded-2xl border border-brand-border/30 flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center font-black text-white shadow-inner overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.name?.[0] || email?.[0] || 'U').toUpperCase()
                )}
             </div>
             <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.name?.toUpperCase() || email?.split('@')[0].toUpperCase()}</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                   Authorized Node
                </div>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-gray-400 font-bold text-sm hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={20} />
            Secure Terminate
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto bg-brand-bg">
         <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
         <Outlet />
      </main>
    </div>
  );
}



