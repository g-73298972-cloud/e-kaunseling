
import React, { useRef } from 'react';
import { UserProfile, UserEmotion } from '../types';
import { Camera, ShieldCheck, Heart, Star, Sparkles, Shield, Zap, Sun, Coffee, Target, School } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  onAvatarUpdate: (url: string) => void;
  onSchoolLogoUpdate: (url: string) => void;
  onEmotionUpdate: (emotion: UserEmotion) => void;
  isOwner: boolean;
}

const EMOTIONS = [
  { emoji: '💖', label: 'AMAZING', icon: <Sparkles size={14} /> },
  { emoji: '⚡', label: 'CHARGED', icon: <Zap size={14} /> },
  { emoji: '💗', label: 'PASSION', icon: <Heart size={14} /> },
  { emoji: '🔥', label: 'INTENSE', icon: <Sun size={14} /> },
  { emoji: '☕', label: 'FOCUS', icon: <Coffee size={14} /> },
  { emoji: '🎯', label: 'PRECISE', icon: <Target size={14} /> },
];

const Header: React.FC<HeaderProps> = ({ profile, onAvatarUpdate, onSchoolLogoUpdate, onEmotionUpdate, isOwner }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarUpdate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchoolLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSchoolLogoUpdate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentEmo = profile.currentEmotion || { emoji: '💖', label: 'AMAZING' };

  return (
    <header className="relative bp-card p-10 md:p-14 overflow-hidden border-2 border-zinc-800 shadow-[0_0_60px_var(--accent-glow)]">
      {/* Decorative neon elements */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-[100px] opacity-10"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/10 rounded-full blur-[100px] opacity-10"></div>
      
      {/* School Branding Top Bar */}
      <div className="relative z-20 flex items-center justify-center md:justify-start gap-4 mb-10 border-b border-zinc-900 pb-8 group/school">
         <div 
           onClick={() => isOwner && schoolLogoRef.current?.click()}
           className={`w-16 h-16 rounded-2xl border-2 border-zinc-800 flex items-center justify-center bg-black overflow-hidden relative shadow-[0_0_15px_var(--accent-glow)] transition-all ${isOwner ? 'cursor-pointer hover:border-accent' : ''}`}
         >
           {profile.schoolLogoUrl ? (
             <img src={profile.schoolLogoUrl} alt="School Logo" className="w-full h-full object-contain p-1" />
           ) : (
             <School size={32} className="text-zinc-800" />
           )}
           {isOwner && (
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/school:opacity-100 transition-opacity flex items-center justify-center">
               <Camera size={16} className="text-white" />
             </div>
           )}
         </div>
         <div>
            <h2 className="text-2xl md:text-3xl font-heading text-main uppercase tracking-tighter leading-none">
              {profile.schoolName || "SMK SEMERAH PADI, KUCHING"}
            </h2>
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mt-2">Elite Educational Institution</p>
         </div>
         <input type="file" ref={schoolLogoRef} onChange={handleSchoolLogoChange} className="hidden" accept="image/*" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 pt-4">
        <div className="relative group shrink-0">
          <div 
            onClick={() => isOwner && fileInputRef.current?.click()}
            className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-zinc-900 shadow-[0_0_30px_var(--accent-glow)] overflow-hidden flex flex-col items-center justify-center transition-all bg-zinc-950 relative ${isOwner ? 'cursor-pointer hover:border-accent' : ''}`}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-800">
                <Star size={64} className="fill-zinc-900" />
                <span className="text-[10px] font-bold uppercase mt-4 text-zinc-700 tracking-widest">NO IDENTITY</span>
              </div>
            )}
          </div>
          {isOwner && (
            <button className="absolute bottom-2 right-2 btn-accent w-12 h-12 flex items-center justify-center border-4 border-black rounded-full shadow-xl">
              <Camera size={18} />
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 justify-center md:justify-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-[0.2em] border border-accent/20">
              <ShieldCheck size={12} strokeWidth={3} /> Certified Professional
            </div>
            
            {/* Wellness Status Badge */}
            <div className="relative group/emo inline-flex">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isOwner ? 'cursor-pointer hover:border-accent' : ''} bg-black/40 border-zinc-800`}>
                <span className="text-sm">{currentEmo.emoji}</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{currentEmo.label}</span>
                {isOwner && <Sparkles size={10} className="text-accent animate-pulse" />}
              </div>
              
              {isOwner && (
                <div className="absolute top-full mt-2 left-0 z-50 bg-black border border-zinc-800 rounded-xl p-2 hidden group-hover/emo:grid grid-cols-3 gap-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {EMOTIONS.map(e => (
                    <button 
                      key={e.label}
                      onClick={() => onEmotionUpdate({ ...e, timestamp: Date.now() })}
                      className="p-2 hover:bg-accent hover:text-black rounded-lg transition-colors flex flex-col items-center gap-1"
                    >
                      <span>{e.emoji}</span>
                      <span className="text-[7px] font-bold uppercase">{e.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-heading text-main leading-[1.1] mb-4 tracking-normal">
            {profile.name.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'dynamic-accent-text' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          
          <div className="space-y-4">
            <p className="text-zinc-500 text-xl font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-4">
               Guru Bimbingan & Kaunseling
            </p>
            
            <div className="max-w-2xl border-l-4 border-accent/50 pl-6 py-2">
              <p className="text-zinc-500 text-lg md:text-2xl font-heading leading-relaxed italic uppercase">
                "{profile.quote}"
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-10 border-t border-zinc-900 pt-8">
            <div className="flex items-center gap-4 text-zinc-500">
              <Sparkles size={24} className="text-accent" />
              <div className="text-xs">
                <p className="font-bold text-main uppercase tracking-wider">Active Since</p>
                <p className="font-medium text-accent/80">{profile.since}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-500">
              <Heart size={24} className="text-accent fill-accent" />
              <div className="text-xs">
                <p className="font-bold text-main uppercase tracking-wider">Core Power</p>
                <p className="font-medium text-accent/80">Empathy & Insight</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
