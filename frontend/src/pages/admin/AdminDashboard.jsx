import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, Bot, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_docs: 0, total_queries: 0, active_employees: 0, failed_queries: 0, chart: []
  });

  useEffect(() => {
    const fetchMetrics = () => {
      axios.get('http://localhost:8005/analytics/metrics').then(res => setMetrics(res.data));
    };
    
    fetchMetrics(); // Initial fetch
    const interval = setInterval(fetchMetrics, 5000); // Poll every 5s
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">System Global Dashboard</h1>
        <p className="text-gray-400 mt-1 font-medium">Enterprise AI Knowledge Base Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Docs Uploaded', value: metrics.total_docs, icon: FileText, color: 'text-brand-accent', bg: 'bg-brand-primary/20', border: 'border-brand-primary/30' },
          { title: 'Total Handled Queries', value: metrics.total_queries, icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
          { title: 'Active Employees', value: metrics.active_employees, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
          { title: 'Failed System Fallbacks', value: metrics.failed_queries, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-6 rounded-2xl shadow-xl flex items-center justify-between hover:bg-brand-surface/60 transition-colors group relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
             <div>
               <p className="text-gray-400 text-sm font-semibold mb-1">{stat.title}</p>
               <h3 className="text-3xl font-black text-white">{stat.value}</h3>
             </div>
             <div className={`${stat.bg} ${stat.color} ${stat.border} border p-4 rounded-xl shadow-inner group-hover:scale-110 transition-transform`}>
               <stat.icon size={28}/>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent"></div>
        <h3 className="text-lg font-bold text-white mb-6 border-b border-brand-border/30 pb-4">Knowledge Utilization vs Queries</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.chart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88057920"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#F96DEA80'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#F96DEA80'}}/>
              <Tooltip 
                cursor={{fill: '#6A106740'}} 
                contentStyle={{backgroundColor: '#490665', borderRadius: '12px', border: '1px solid #880579', color: '#ffffff', boxShadow: '0 0 20px rgba(229, 20, 163, 0.2)'}}
                itemStyle={{color: '#ffffff'}}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="documents" name="Total Documents" fill="#E514A3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="queries" name="Total Queries" fill="#F96DEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}




