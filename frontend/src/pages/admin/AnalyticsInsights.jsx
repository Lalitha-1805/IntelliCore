import React from 'react';
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

export default function AnalyticsInsights() {
  const data = [
    { name: 'HR Policies', value: 400 },
    { name: 'Finance Rules', value: 300 },
    { name: 'IT Security', value: 300 },
    { name: 'General', value: 200 },
  ];
  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
       <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System AI Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium">Deep dive into enterprise context distributions.</p>
       </div>
       <div className="bg-white rounded-2xl shadow-sm border p-8 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-slate-700 mb-8 self-start w-full border-b pb-4">Query Distribution by Domain</h2>
          <div className="w-full max-w-lg h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-6 text-sm font-semibold">
             {data.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                   <span className="text-slate-600">{d.name}</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}




