
import React from 'react';
import { UserEmotion } from '../types';
import { Sparkles, Zap, Heart, Sun, Coffee, Target } from 'lucide-react';

interface EmotionWidgetProps {
  currentEmotion?: UserEmotion;
  onUpdate: (emotion: UserEmotion) => void;
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

const EmotionWidget: React.FC<EmotionWidgetProps> = ({ currentEmotion, onUpdate, isOwner }) => {
  return (
    <div className="bp-card p-4 flex flex-col md:flex-row items-center gap-4 border-l-4 border-pink-500 bg-zinc-950/40 backdrop-blur-md mb-8">
      {/* Current Status Section */}
      <div className="flex items-center gap-4 shrink-0 border-r border-zinc-900 pr-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-2xl shadow-[inset_0_0_10px_rgba(255,0,122,0.2)] border border-zinc-800 transition-transform duration-500 hover:scale-110">
          {currentEmotion?.emoji || '💖'}
        </div>
        <div>
          <p className="text-[8px] font-black text-pink-500 uppercase tracking-[0.2em] leading-none mb-1">How am i doing right now?</p>
          <h3 className="text-lg font-heading text-white tracking-tighter leading-none">
            {currentEmotion?.label || 'AMAZING'}
          </h3>
        </div>
      </div>

      {/* Control / Display Section */}
      {isOwner ? (
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mr-2 hidden lg:block">Update Status:</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((e) => (
              <button
                key={e.label}
                onClick={() => onUpdate({ ...e, timestamp: Date.now() })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
                  currentEmotion?.label === e.label
                    ? 'bg-pink-500 text-black border-pink-500 shadow-[0_0_10px_rgba(255,0,122,0.3)]'
                    : 'bg-black border-zinc-900 text-zinc-500 hover:border-pink-500/30'
                }`}
              >
                <span className="text-xs">{e.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-tight hidden sm:block">{e.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center overflow-hidden">
          <p className="text-sm font-medium text-zinc-400 italic truncate uppercase tracking-tight">
            "Fokus utama saya hari ini adalah mengekalkan tahap <span className="text-pink-500 font-black">{currentEmotion?.label || 'AMAZING'}</span> demi bimbingan berimpak tinggi."
          </p>
        </div>
      )}

      <div className="hidden xl:flex items-center gap-2 border-l border-zinc-900 pl-6">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#ff007a]"></div>
        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Active System</span>
      </div>
    </div>
  );
};

export default EmotionWidget;
