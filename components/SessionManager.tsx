
import React, { useState, useRef } from 'react';
import { SessionEntry, FileAttachment } from '../types';
import { Plus, X, Trash2, ImageIcon, Eye, MessageSquare, Users, FileText, Calendar, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface SessionManagerProps {
  sessions: SessionEntry[];
  onAdd: (session: Omit<SessionEntry, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<SessionEntry>) => void;
  onRemoveImage: (sessionId: string, imageIndex: number) => void;
  onUpdateFile: (sessionId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ sessionId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: reader.result as string, comments: [], reactions: [] }]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && images.length === 0) return;
    onAdd({ caption: caption.toUpperCase(), images });
    setCaption(''); setImages([]);
  };

  const startEditing = (session: SessionEntry) => {
    setEditingId(session.id);
    setEditCaption(session.caption);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, { caption: editCaption.toUpperCase() });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black rounded-3xl flex items-center justify-center shadow-[0_0_25px_rgba(255,0,122,0.4)]"><Users size={32} strokeWidth={3} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">Daftar Klien Kaunseling</h2>
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-[0.3em] mt-2">Pangkalan Data Intervensi Strategik</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Butiran Klien & Isu</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="NAMA KLIEN, KELAS, ISU UTAMA..." className="w-full bg-black border border-zinc-900 rounded-2xl p-6 text-sm font-bold focus:border-pink-500 outline-none transition-all min-h-[140px] uppercase text-white shadow-inner" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Visual Evidence</label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-900 rounded-2xl bg-black">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800 shadow-xl group">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md hover:scale-110 transition-transform"><X size={10} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 text-zinc-800 hover:text-pink-500 transition-all">
                  <Plus size={28} />
                  <span className="text-[8px] font-black uppercase">Add Image</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-lg">Daftar Rekod Sesi</button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {sessions.length === 0 ? (
          <div className="text-center py-24 text-zinc-800 italic uppercase font-black tracking-widest border-2 border-dashed border-zinc-900 rounded-[2rem]">No Active Cases</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bp-card p-10 group relative border-l-4 border-white transition-all duration-500">
              <div className="flex justify-between items-start mb-8 border-b border-zinc-900 pb-6">
                <div className="space-y-2 flex-1 mr-4">
                  <div className="flex items-center gap-3 text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">
                    <Calendar size={12} className="text-pink-500" /> Sesi Pada {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                  {editingId === session.id ? (
                    <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full bg-black border border-pink-500 rounded-xl p-4 text-sm font-bold text-white uppercase outline-none shadow-[0_0_15px_rgba(255,0,122,0.2)]" />
                  ) : (
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tighter leading-tight">{session.caption}</h3>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingId === session.id ? (
                    <>
                      <button onClick={saveEdit} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all"><Check size={20} /></button>
                      <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"><X size={20} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(session)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-white transition-all rounded-xl hover:bg-zinc-900"><Edit2 size={18} /></button>
                      <button onClick={() => onDelete(session.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 transition-all rounded-xl hover:bg-red-950/30"><Trash2 size={18} /></button>
                    </>
                  )}
                </div>
              </div>
              
              {session.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {session.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-900 bg-black group/img cursor-pointer shadow-lg" onClick={() => setSelectedFile({ sessionId: session.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 opacity-60 group-hover/img:opacity-100" />
                      <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={24} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {selectedFile && (
        <FileViewModal file={selectedFile.file} type="image" onClose={() => setSelectedFile(null)} onAddComment={()=>{}} onDeleteComment={()=>{}} onAddReaction={()=>{}} isOwner={isOwner} />
      )}
    </div>
  );
};

export default SessionManager;
