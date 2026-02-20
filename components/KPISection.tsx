
import React, { useState } from 'react';
import { Heart, Activity, Edit2, Check, Clock } from 'lucide-react';
import { SessionEntry, ProgramRecord } from '../types';

interface KPISectionProps {
  sessions: SessionEntry[];
  records: ProgramRecord[];
  isOwner: boolean;
  manualKpiIndividual: number;
  manualKpiGroup: number;
  lastUpdateIndividual?: number;
  lastUpdateGroup?: number;
  onUpdateKpi: (type: 'manualKpiIndividual' | 'manualKpiGroup', val: number) => void;
}

const KPISection: React.FC<KPISectionProps> = ({ 
  sessions, 
  records, 
  isOwner, 
  manualKpiIndividual, 
  manualKpiGroup, 
  lastUpdateIndividual,
  lastUpdateGroup,
  onUpdateKpi 
}) => {
  // Logic to identify Individual vs Group based on caption keywords
  const autoCountIndividual = sessions.filter(s => 
    s.caption.includes('INDIVIDU') || s.caption.includes('PERSONAL')
  ).length;

  const autoCountGroup = sessions.filter(s => 
    s.caption.includes('KELOMPOK') || s.caption.includes('GROUP')
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KPICard 
        icon={<Heart size={24} strokeWidth={3} />}
        label="Sesi Individu"
        autoCount={autoCountIndividual}
        manualCount={manualKpiIndividual}
        lastUpdate={lastUpdateIndividual}
        target="150"
        unit="KLIEN"
        accent="pink"
        isOwner={isOwner}
        onUpdate={(val) => onUpdateKpi('manualKpiIndividual', val)}
      />
      <KPICard 
        icon={<Activity size={24} strokeWidth={3} />}
        label="Sesi Kelompok"
        autoCount={autoCountGroup}
        manualCount={manualKpiGroup}
        lastUpdate={lastUpdateGroup}
        target="40"
        unit="SESI"
        accent="white"
        isOwner={isOwner}
        onUpdate={(val) => onUpdateKpi('manualKpiGroup', val)}
      />
    </div>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  autoCount: number;
  manualCount: number;
  lastUpdate?: number;
  target: string;
  unit: string;
  accent: 'pink' | 'white';
  isOwner: boolean;
  onUpdate: (val: number) => void;
}

const KPICard: React.FC<KPICardProps> = ({ 
  icon, 
  label, 
  autoCount, 
  manualCount, 
  lastUpdate,
  target, 
  unit, 
  accent, 
  isOwner, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(manualCount.toString());

  const totalCount = autoCount + manualCount;
  const progressText = `${totalCount} / ${target}`;

  const handleSave = () => {
    const numValue = parseInt(tempValue) || 0;
    onUpdate(numValue);
    setIsEditing(false);
  };

  const formatDate = (ts?: number) => {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`bp-card p-8 group overflow-hidden relative border-l-4 ${accent === 'pink' ? 'border-pink-500' : 'border-white'} transition-all duration-500 hover:scale-[1.02]`}>
      {/* Background glow effect */}
      <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all group-hover:opacity-40 ${accent === 'pink' ? 'bg-pink-500' : 'bg-white'}`}></div>
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
            accent === 'pink' ? 'bg-pink-500 text-black shadow-[0_0_15px_rgba(255,0,122,0.4)]' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
          }`}>
            {icon}
          </div>
          {isOwner && (
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="p-2 border border-zinc-800 rounded-lg text-zinc-500 hover:text-pink-500 hover:border-pink-500/50 transition-all bg-black/40"
            >
              {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
            </button>
          )}
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</p>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
              accent === 'pink' ? 'border-pink-500/30 text-pink-500' : 'border-white/30 text-white'
            }`}>
              TARGET: {target}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <input 
                    type="number"
                    value={tempValue}
                    autoFocus
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="bg-black border-b-2 border-pink-500 text-4xl font-heading text-white w-24 outline-none pink-glow"
                  />
                  <span className="text-xl font-heading text-zinc-600"> + {autoCount} AUTO</span>
                </div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Masukkan jumlah sesi manual (Offline)</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-heading text-white leading-none tracking-tighter">
                  {progressText}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${accent === 'pink' ? 'text-pink-500' : 'text-zinc-500'}`}>
                  {unit}
                </span>
              </>
            )}
          </div>
          
          {/* Progress Mini Bar & Date */}
          {!isEditing && (
            <div className="mt-4 space-y-2">
               <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${accent === 'pink' ? 'bg-pink-500' : 'bg-white'}`}
                    style={{ width: `${Math.min((totalCount / parseInt(target)) * 100, 100)}%` }}
                  />
               </div>
               {lastUpdate && (
                 <div className="flex items-center gap-1.5 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                   <Clock size={10} /> Kemaskini: {formatDate(lastUpdate)}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPISection;
