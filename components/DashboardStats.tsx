
import React from 'react';
import { ProgramRecord, FocusArea } from '../types';
import { BarChart3, PieChart, Users, Star } from 'lucide-react';

interface DashboardStatsProps {
  records: ProgramRecord[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ records }) => {
  const getCount = (focus: FocusArea) => records.filter(r => r.focusArea === focus).length;

  const stats = [
    { label: 'Jumlah Program', value: records.length, icon: <Star className="text-indigo-600" />, bg: 'bg-indigo-50' },
    { label: 'Sahsiah', value: getCount(FocusArea.SAHSIAH), icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Psikososial', value: getCount(FocusArea.PSIKOSOSIAL), icon: <PieChart className="text-rose-600" />, bg: 'bg-rose-50' },
    { label: 'Pencapaian', value: records.length > 0 ? 'Aktif' : 'Permulaan', icon: <BarChart3 className="text-amber-600" />, bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
