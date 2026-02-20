
import React from 'react';
import { FocusArea } from '../types';
import { Target, ShieldCheck, Briefcase, Heart } from 'lucide-react';

interface FocusTabsProps {
  selectedFocus: FocusArea;
  onSelect: (focus: FocusArea) => void;
}

const FocusTabs: React.FC<FocusTabsProps> = ({ selectedFocus, onSelect }) => {
  const items = [
    { id: FocusArea.SAHSIAH, icon: <Target size={20} />, label: 'Sahsiah Diri' },
    { id: FocusArea.DISIPLIN, icon: <ShieldCheck size={20} />, label: 'Disiplin Murid' },
    { id: FocusArea.KERJAYA, icon: <Briefcase size={20} />, label: 'Kerjaya' },
    { id: FocusArea.PSIKOSOSIAL, icon: <Heart size={20} />, label: 'Psikososial' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left flex items-start gap-4 ${
            selectedFocus === item.id
              ? `bg-pink-500 text-black border-pink-500 shadow-[0_0_20px_rgba(255,0,122,0.3)] -translate-y-1`
              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-pink-500/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            selectedFocus === item.id ? 'bg-black text-pink-500' : 'bg-zinc-900 text-zinc-700'
          }`}>
            {item.icon}
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedFocus === item.id ? 'text-black/60' : 'text-zinc-600'}`}>Fokus Utama</p>
            <span className="text-xs font-black leading-tight uppercase block">
              {item.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FocusTabs;
