
import React, { useState } from 'react';
import { Comment, Reaction } from '../types';
import { Send, User, Clock, Trash2, Shield } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  reactions: Reaction[];
  onAddComment: (text: string, userName: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReaction: (emoji: string) => void;
  isOwner: boolean;
}

const EMOJI_LIST = ['💖', '✨', '🌸', '🎀', '🧸', '🍭', '🍓', '🦄'];

const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, reactions, onAddComment, onDeleteComment, onAddReaction, isOwner 
}) => {
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState(isOwner ? 'CIKGU LILY' : 'PELAWAT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.toUpperCase(), userName.toUpperCase());
      setNewComment('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Reactions Header */}
      <div className="p-6 border-b border-zinc-900 bg-black/40">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Affix Reaction</p>
        <div className="flex flex-wrap gap-2">
          {EMOJI_LIST.map((emoji) => {
            const reaction = reactions.find(r => r.emoji === emoji);
            return (
              <button
                key={emoji}
                onClick={() => onAddReaction(emoji)}
                className={`flex items-center gap-2 px-3 py-2 border-2 transition-all active:scale-90 rounded-xl ${
                  reaction 
                    ? 'bg-pink-500 border-pink-500 text-black shadow-[0_0_10px_rgba(255,0,122,0.3)]' 
                    : 'bg-black border-zinc-800 text-zinc-500 hover:border-pink-500/50'
                }`}
              >
                <span className="text-base">{emoji}</span>
                {reaction && <span className="text-[10px] font-black">{reaction.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-zinc-800 italic text-sm uppercase font-bold tracking-widest">
            Tiada Komen Lagi.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group border-b border-zinc-900/50 pb-5">
              <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-700 shrink-0 bg-black">
                <User size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{comment.userName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                    {isOwner && (
                      <button onClick={() => onDeleteComment(comment.id)} className="text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm font-medium text-zinc-300 uppercase leading-tight">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-zinc-900 bg-black/60 space-y-4">
        {!isOwner && (
          <input 
            type="text" value={userName} onChange={(e) => setUserName(e.target.value.toUpperCase())} 
            placeholder="NAMA ANDA..."
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black outline-none uppercase text-pink-500 focus:border-pink-500/50"
          />
        )}
        <div className="relative">
          <textarea
            value={newComment} onChange={(e) => setNewComment(e.target.value.toUpperCase())}
            placeholder="TULIS KOMEN ANDA..."
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-xs font-bold outline-none transition-all min-h-[100px] pr-12 uppercase text-white focus:border-pink-500"
          />
          <button
            type="submit" disabled={!newComment.trim()}
            className="absolute bottom-4 right-4 w-10 h-10 btn-pink rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 disabled:transform-none"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
