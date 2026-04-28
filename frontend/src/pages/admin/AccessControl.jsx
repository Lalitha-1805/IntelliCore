import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';

export default function AccessControl() {
  return (
    <div className="p-8 max-w-7xl mx-auto font-sans h-full">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Boundary Matrix</h1>
          <p className="text-gray-500 mt-1 font-medium">Visualize context permissions enforced prior to LLM compilation.</p>
       </div>
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <ShieldCheck className="text-indigo-600"/>
             <h2 className="font-bold text-slate-700">Department x Role Enforcements</h2>
          </div>
          <div className="p-8">
             <div className="grid grid-cols-4 gap-4">
                <div className="font-bold text-gray-400 uppercase text-xs tracking-wider">Role Type</div>
                <div className="font-bold text-indigo-600 uppercase text-xs tracking-wider text-center bg-indigo-50 py-2 rounded">HR Vector</div>
                <div className="font-bold text-blue-600 uppercase text-xs tracking-wider text-center bg-blue-50 py-2 rounded">Finance Vector</div>
                <div className="font-bold text-emerald-600 uppercase text-xs tracking-wider text-center bg-emerald-50 py-2 rounded">IT Vector</div>
                
                <div className="font-semibold text-slate-700 flex items-center gap-2 mt-4"><UserCheck size={16}/> Admin / Exec</div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Full Access</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Full Access</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Full Access</span></div>

                <div className="font-semibold text-slate-700 flex items-center gap-2 mt-4"><UserCheck size={16}/> Full-time Employee</div>
                <div className="text-center mt-4"><span className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full font-bold">BLOCKED</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Isolate (Finance Only)</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Isolate (IT Only)</span></div>

                <div className="font-semibold text-slate-700 flex items-center gap-2 mt-4"><UserCheck size={16}/> Summer Intern</div>
                <div className="text-center mt-4"><span className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full font-bold">BLOCKED</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Isolate (Intern, Finance)</span></div>
                <div className="text-center mt-4"><span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">Isolate (Intern, IT)</span></div>
             </div>
          </div>
       </div>
    </div>
  );
}




