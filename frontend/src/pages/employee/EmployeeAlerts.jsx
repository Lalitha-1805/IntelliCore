import React, { useState, useEffect } from 'react';
import { BellRing, Check, MailOpen, Mail } from 'lucide-react';
import axios from 'axios';

export default function EmployeeAlerts() {
  const [alerts, setAlerts] = useState([]);
  const department = localStorage.getItem('department') || 'Engineering';
  const email = localStorage.getItem('email');

  useEffect(() => {
    fetchAlerts();
  }, [department, email]);

  const fetchAlerts = () => {
    if (email) {
      axios.get(`http://localhost:8005/alerts?email=${email}&department=${department}`)
        .then(res => {
          setAlerts(res.data);
        })
        .catch(err => {
           console.error("Error fetching alerts", err);
           // Fallback mock data
           setAlerts([
              { id: '1', title: 'New Remote Work Policy Updated', date: '2026-04-24', read: false },
              { id: '2', title: 'Quarterly Security Training Required', date: '2026-04-20', read: false },
              { id: '3', title: 'Health Benefits Open Enrollment', date: '2026-04-15', read: true }
           ]);
        });
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`http://localhost:8005/alerts/${id}/read?email=${email}`);
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      ));
    } catch (err) {
      console.error("Failed to mark read in DB");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = alerts.filter(a => !a.read);
      await Promise.all(unread.map(a => axios.post(`http://localhost:8005/alerts/${a.id}/read?email=${email}`)));
      setAlerts(alerts.map(alert => ({ ...alert, read: true })));
    } catch (e) {}
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-center justify-between border-b border-brand-border/50/50 pb-6">
         <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
               <BellRing className="text-brand-primary" size={32} /> Policy Alerts
               {unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg shadow-brand-primary/30">
                     {unreadCount} New
                  </span>
               )}
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Automatic notifications for policy changes. Status is synced to your account.</p>
         </div>
         {unreadCount > 0 && (
            <button 
               onClick={markAllAsRead}
               className="text-sm font-bold text-gray-200 hover:text-white transition-all bg-brand-surface hover:bg-slate-700 border border-brand-border/50 hover:border-slate-500 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"
            >
               <Check size={16} /> Mark all as read
            </button>
         )}
      </div>
      
      <div className="space-y-4">
         {alerts.length === 0 && (
            <div className="text-center py-20 text-gray-500 font-medium">
               No alerts found for your department.
            </div>
         )}
         {alerts.map(alert => (
            <div 
               key={alert.id} 
               className={`p-6 rounded-[1.5rem] border flex items-center justify-between transition-all duration-300 ${
                  !alert.read 
                  ? 'bg-brand-surface/80 border-brand-primary/30 shadow-lg shadow-indigo-500/10' 
                  : 'bg-brand-bg/50 border-slate-800 opacity-60 hover:opacity-100'
               }`}
            >
               <div className="flex gap-5 items-start">
                  <div className={`mt-1 p-3 rounded-2xl ${
                     !alert.read 
                     ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-inner' 
                     : 'bg-brand-surface text-gray-500 border border-brand-border/50'
                  }`}>
                     {!alert.read ? <Mail size={22} /> : <MailOpen size={22} />}
                  </div>
                  <div>
                     <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-bold ${!alert.read ? 'text-white' : 'text-gray-400'}`}>
                           {alert.title}
                        </h3>
                        {!alert.read && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>}
                     </div>
                     <p className="text-sm text-gray-500 font-medium font-mono mt-2">{alert.date}</p>
                  </div>
               </div>
               
               {!alert.read && (
                  <button 
                     onClick={() => markAsRead(alert.id)}
                     className="ml-4 p-3 rounded-xl bg-slate-700/50 hover:bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-gray-200 hover:text-white transition-all shadow-sm group border border-slate-600 hover:border-brand-primary"
                     title="Mark as read"
                  >
                     <Check size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
               )}
            </div>
         ))}
      </div>
    </div>
  );
}




