
import React, { useState } from 'react';
import { VisitorFeedback, Comment } from '../types';
import { Star, Send, User, MessageCircle, Quote, Trash2, Heart, Sparkles, Smile, ShieldCheck } from 'lucide-react';

interface VisitorGuestbookProps {
  feedbacks: VisitorFeedback[];
  onAddFeedback: (feedback: Omit<VisitorFeedback, 'id' | 'timestamp' | 'comments' | 'reactions'>) => void;
  onDeleteFeedback: (id: string) => void;
  onUpdateFeedback: (feedbackId: string, updated: VisitorFeedback) => void;
  isOwner: boolean;
}

interface HeartParticle {
  id: string;
  left: number;
  duration: number;
  size: number;
}

const REACTION_EMOJIS = ['💖', '🔥', '✨', '🌸', '👍', '🙌'];

const VisitorGuestbook: React.FC<VisitorGuestbookProps> = ({ feedbacks, onAddFeedback, onDeleteFeedback, onUpdateFeedback, isOwner }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  const [replyInputs, setReplyInputs] = useState<Record<string, { text: string; name: string }>>({});

  const triggerHearts = () => {
    const newHearts: HeartParticle[] = Array.from({ length: 30 }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      left: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      size: 10 + Math.random() * 30
    }));
    
    setHearts(newHearts);
    
    // Bersihkan hati selepas animasi tamat (5 saat)
    setTimeout(() => {
      setHearts([]);
    }, 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    onAddFeedback({ name: name.toUpperCase(), comment: comment.toUpperCase(), rating });
    
    // Cetuskan kesan hati terbang
    triggerHearts();
    
    setName('');
    setComment('');
    setRating(5);
  };

  const handleAddReaction = (feedback: VisitorFeedback, emoji: string) => {
    const updatedReactions = [...(feedback.reactions || [])];
    const index = updatedReactions.findIndex(r => r.emoji === emoji);
    if (index > -1) {
      updatedReactions[index].count += 1;
    } else {
      updatedReactions.push({ emoji, count: 1 });
    }
    onUpdateFeedback(feedback.id, { ...feedback, reactions: updatedReactions });
  };

  const handleAddReply = (feedback: VisitorFeedback) => {
    const input = replyInputs[feedback.id];
    if (!input || !input.text.trim()) return;

    const replyName = isOwner ? 'CIKGU LILY' : (input.name?.trim() || 'PELAWAT');
    
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: replyName.toUpperCase(),
      text: input.text.toUpperCase(),
      timestamp: Date.now()
    };

    onUpdateFeedback(feedback.id, {
      ...feedback,
      comments: [...(feedback.comments || []), newComment]
    });

    setReplyInputs(prev => ({ 
      ...prev, 
      [feedback.id]: { ...prev[feedback.id], text: '' } 
    }));
  };

  const handleDeleteReply = (feedback: VisitorFeedback, commentId: string) => {
    if (!isOwner) return;
    onUpdateFeedback(feedback.id, {
      ...feedback,
      comments: feedback.comments.filter(c => c.id !== commentId)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      {/* Flying Hearts Particles Layer */}
      {hearts.map(heart => (
        <div 
          key={heart.id} 
          className="heart-particle"
          style={{ 
            left: `${heart.left}%`, 
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`
          }}
        >
          💖
        </div>
      ))}

      {/* Form Kiri (Input Maklum Balas Baru) */}
      <div className="lg:col-span-1 bp-card border-l-8 border-pink-500 overflow-hidden flex flex-col h-full">
        <div className="p-8 bg-gradient-to-b from-pink-500/10 to-transparent border-b border-zinc-900 relative">
          <Quote size={60} className="absolute -top-3 -left-3 text-pink-500/10 rotate-12" />
          <h2 className="text-xl md:text-3xl font-heading text-white leading-tight pink-glow italic text-center px-4">
            "Kindness is a language which the deaf can hear and the blind can see"
          </h2>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-pink-500" size={24} />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Kirim Maklum Balas</h3>
              <p className="text-[10px] font-black text-pink-500 italic mt-1 tracking-wider lowercase">please let me know you were here! 😊</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Nama Anda</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="NAMA PENUH..." 
                  className="w-full bg-black border-2 border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-pink-500 outline-none uppercase transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Komen / Ucapan</label>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="TULIS SESUATU UNTUK CIKGU LILY..." 
                className="w-full bg-black border-2 border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-pink-500 outline-none min-h-[100px] uppercase transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Penarafan (Rating)</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all active:scale-90"
                  >
                    <Star 
                      size={28} 
                      fill={(hoverRating || rating) >= star ? "#ff007a" : "transparent"} 
                      className={(hoverRating || rating) >= star ? "text-pink-500 pink-glow" : "text-zinc-800"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full btn-pink py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg uppercase tracking-widest">
              <Send size={18} /> Kirim Komen
            </button>
          </form>
        </div>
      </div>

      {/* List Kanan (Interaktif) */}
      <div className="lg:col-span-2 space-y-6 max-h-[850px] overflow-y-auto pr-2 custom-scrollbar">
        {feedbacks.length === 0 ? (
          <div className="bp-card p-16 text-center border-dashed border-zinc-900 bg-transparent h-full flex flex-col items-center justify-center">
            <User size={60} className="text-zinc-800 mb-6 opacity-20" />
            <p className="text-zinc-700 font-bold uppercase tracking-widest text-xs italic">Belum ada maklum balas pelawat.</p>
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="bp-card p-8 border-zinc-900 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border-2 border-pink-500/20 shadow-inner">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-heading text-xl uppercase tracking-tight">{fb.name}</h4>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                      {new Date(fb.timestamp).toLocaleDateString()} • {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={14} 
                        fill={fb.rating >= s ? "#ff007a" : "transparent"} 
                        className={fb.rating >= s ? "text-pink-500" : "text-zinc-800"} 
                      />
                    ))}
                  </div>
                  {isOwner && (
                    <button onClick={() => onDeleteFeedback(fb.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Ucapan Utama */}
              <p className="text-zinc-200 text-lg font-medium leading-relaxed uppercase bg-black/60 p-6 rounded-3xl border border-zinc-900 shadow-inner">
                {fb.comment}
              </p>

              {/* Reaksi & Balasan Section */}
              <div className="flex flex-col gap-6 pt-4 border-t border-zinc-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-2">Reaksi:</span>
                  <div className="flex flex-wrap gap-2">
                    {REACTION_EMOJIS.map(emoji => {
                      const reaction = (fb.reactions || []).find(r => r.emoji === emoji);
                      return (
                        <button 
                          key={emoji} 
                          onClick={() => handleAddReaction(fb, emoji)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm transition-all active:scale-90 ${reaction ? 'bg-pink-500/10 border-pink-500/50 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                          <span className="text-lg">{emoji}</span>
                          {reaction && <span className="text-[10px] font-bold pink-glow">{reaction.count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* List Komen Balasan (Interaksi Thread) */}
                {(fb.comments || []).length > 0 && (
                  <div className="ml-10 space-y-4 border-l-4 border-pink-500/30 pl-6 py-2">
                    {fb.comments.map(c => (
                      <div key={c.id} className="group relative">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${c.userName === 'CIKGU LILY' ? 'text-pink-500 flex items-center gap-2' : 'text-zinc-500'}`}>
                            {c.userName} {c.userName === 'CIKGU LILY' && <ShieldCheck size={12} />}
                          </span>
                          <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">
                            {new Date(c.timestamp).toLocaleDateString()}
                          </span>
                          {isOwner && (
                            <button onClick={() => handleDeleteReply(fb, c.id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all p-1">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm font-bold uppercase leading-relaxed p-4 rounded-2xl border-2 ${c.userName === 'CIKGU LILY' ? 'bg-pink-500/5 border-pink-500/20 text-zinc-200' : 'bg-zinc-950/50 border-zinc-900/50 text-zinc-400'}`}>
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Borang Balasan Mini */}
                <div className="flex flex-col gap-4 mt-2 bg-zinc-950 p-6 rounded-3xl border-2 border-zinc-900 shadow-inner">
                  <div className="flex items-center gap-3 mb-1">
                    <Smile size={16} className="text-pink-500" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      {isOwner ? "Balas Sebagai Cikgu Lily:" : "Sertai Perbualan / Balas:"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {!isOwner && (
                       <div className="relative">
                         <User size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                         <input 
                           type="text" 
                           value={replyInputs[fb.id]?.name || ''} 
                           onChange={(e) => setReplyInputs(prev => ({ ...prev, [fb.id]: { ...prev[fb.id], name: e.target.value } }))}
                           placeholder="NAMA ANDA..."
                           className="w-full bg-black border-2 border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-[11px] font-bold text-pink-500 uppercase outline-none focus:border-pink-500/50"
                         />
                       </div>
                    )}
                    
                    <div className="relative">
                      <textarea 
                        value={replyInputs[fb.id]?.text || ''} 
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [fb.id]: { ...prev[fb.id], text: e.target.value } }))}
                        placeholder={isOwner ? "TULIS BALASAN ANDA DI SINI..." : "TULIS SESUATU UNTUK MEMBALAS..."}
                        className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 pr-16 text-sm font-bold text-white uppercase outline-none focus:border-pink-500 min-h-[80px] custom-scrollbar"
                      />
                      <button 
                        onClick={() => handleAddReply(fb)}
                        disabled={!replyInputs[fb.id]?.text.trim()}
                        className="absolute bottom-4 right-4 w-10 h-10 btn-pink rounded-xl flex items-center justify-center shadow-lg disabled:opacity-20 disabled:scale-95 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisitorGuestbook;
