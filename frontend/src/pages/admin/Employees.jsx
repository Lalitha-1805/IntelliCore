import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Shield, UserCheck, Search } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentEmail = localStorage.getItem('email');

  useEffect(() => {
    axios.get('http://localhost:8005/users').then(res => setEmployees(res.data));
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Active Employee Directory</h1>
          <p className="text-gray-400 mt-1 font-medium">Manage and view all registered identities in the Genesis system.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full bg-brand-surface/80 border border-brand-border/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all font-medium shadow-inner placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card backdrop-blur-xl rounded-3xl shadow-xl border border-brand-border/50/50 overflow-auto flex-1">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-brand-surface/80 text-gray-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-brand-border/50/50">
            <tr>
              <th className="px-6 py-5">Employee Identity</th>
              <th className="px-6 py-5">System Role</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Reference ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className={`hover:bg-slate-700/30 transition-colors group ${emp.email === currentEmail ? 'bg-brand-primary/10' : ''}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${emp.email === currentEmail ? 'bg-gradient-to-r from-brand-border via-brand-primary to-brand-accent text-white' : 'bg-slate-700 text-gray-200 group-hover:bg-slate-600 transition-colors'}`}>
                      {emp.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 flex items-center gap-2">
                        {emp.name}
                        {emp.email === currentEmail && <span className="bg-brand-primary/20 text-indigo-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">You</span>}
                      </p>
                      <p className="text-gray-500 text-xs font-medium flex items-center gap-1 mt-1"><Mail size={12}/> {emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-medium">
                  <span className="text-gray-200 flex items-center gap-1"><Shield size={14} className="text-brand-primary"/> {emp.role === 'Admin' ? 'HR / Administrator' : 'Standard Employee'}</span>
                </td>
                <td className="px-6 py-5">
                   {emp.email === currentEmail ? (
                     <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-tight border border-emerald-500/30">
                       <UserCheck size={12}/> Active Session
                     </span>
                   ) : (
                     <span className="text-gray-500 italic">Offline</span>
                   )}
                </td>
                <td className="px-6 py-5 text-right font-mono text-[10px] text-gray-500">
                   {emp.id}
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center">
                   <p className="text-gray-500 font-bold italic">No identities matching "{searchTerm}" found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




