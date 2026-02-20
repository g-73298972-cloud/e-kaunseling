
import React, { useState, useRef } from 'react';
import { DailyDutyRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Calendar, Clock, MapPin, Eye, MessageSquare, UserCheck } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface DailyDutyManagerProps {
  records: DailyDutyRecord[];
  onAdd: (record: Omit<DailyDutyRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const DailyDutyManager: React.FC<DailyDutyManagerProps> = ({ records, onAdd, onDelete, onRemoveImage, onUpdateFile, isOwner }) => {
  const [formData, setFormData] = useState({ tarikh: '', lokasi: '', masa: '' });
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            comments: [],
            reactions: []
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    if (!formData.tarikh || !formData.lokasi || !formData.masa) {
      alert("PLEASE FILL ALL PATROL DETAILS.");
      return;
    }
    onAdd({ ...formData, images });
    setFormData({ tarikh: '', lokasi: '', masa: '' });
    setImages([]);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b-4 border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-2xl shadow-lg rotate-[-3deg]"><UserCheck size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none">BORDER PATROL</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2">DAILY DUTY ROSTER</p>
        </div>
      </div>

      {isOwner && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 text-center">LOG NEW PATROL</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> PATROL DATE</label>
                <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> SHIFT TIME</label>
                <input type="text" name="masa" value={formData.masa} onChange={handleInputChange} placeholder="E.G. 7.15 - 7.30 AM..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> PATROL ZONE</label>
              <input type="text" name="lokasi" value={formData.lokasi} onChange={handleInputChange} placeholder="E.G. MAIN GATE / TOWN HALL..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">PATROL EVIDENCE</label>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-zinc-800 bg-black rounded-2xl">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 border border-zinc-800 rounded-xl overflow-hidden">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md shadow-lg"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 hover:text-pink-500 transition-all text-zinc-800">
                  <Plus size={24} />
                  <span className="text-[8px] font-bold">ADD PROOF</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl">
              SAVE PATROL LOG
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {records.length === 0 ? (
          <div className="text-center py-20 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase font-bold">NO PATROL RECORDS.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-10 group relative transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2 italic"><UserCheck size={12} /> BORDER PATROL LOG</p>
                  <h3 className="text-3xl font-heading text-white leading-none uppercase tracking-tighter">{record.lokasi}</h3>
                </div>
                {isOwner && <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-900 text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={24} /></button>}
              </div>
              
              <div className="flex flex-wrap gap-8 mb-8 text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Calendar size={18} className="text-pink-500"/> {record.tarikh}</div>
                  <div className="flex items-center gap-2"><Clock size={18} className="text-pink-500"/> {record.masa}</div>
              </div>

              {record.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {record.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-[3/4] border border-zinc-900 rounded-xl bg-black group/img cursor-pointer transition-all duration-700 overflow-hidden" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                      {isOwner && (
                        <button onClick={(e) => { e.stopPropagation(); onRemoveImage(record.id, idx); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 shadow-lg opacity-0 group-hover/img:opacity-100 transition-all rounded-md">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {file.comments.length > 0 && <div className="absolute top-2 left-2 bg-pink-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1"><MessageSquare size={8} /> {file.comments.length}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {selectedFile && (
        <FileViewModal 
          file={selectedFile.file} 
          type="image" 
          onClose={() => setSelectedFile(null)} 
          onAddComment={(t, u) => {
            const updated = { ...selectedFile.file };
            updated.comments = [...updated.comments, { id: Math.random().toString(36).substr(2, 9), userName: u, text: t, timestamp: Date.now() }];
            onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          /* Fix: Added missing onDeleteComment prop to FileViewModal */
          onDeleteComment={(cid) => {
            const updated = { ...selectedFile.file };
            updated.comments = updated.comments.filter(c => c.id !== cid);
            onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }}
          onAddReaction={(e) => {
            const updated = { ...selectedFile.file };
            const ridx = updated.reactions.findIndex(r => r.emoji === e);
            if (ridx > -1) updated.reactions[ridx].count += 1; else updated.reactions.push({ emoji: e, count: 1 });
            onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default DailyDutyManager;
