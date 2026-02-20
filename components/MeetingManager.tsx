
import React, { useState, useRef } from 'react';
import { MeetingRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Calendar, Clock, MapPin, Eye, ClipboardList, MessageSquare, ScrollText, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface MeetingManagerProps {
  records: MeetingRecord[];
  onAdd: (record: Omit<MeetingRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<MeetingRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const MeetingManager: React.FC<MeetingManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [formData, setFormData] = useState({ tarikh: '', masa: '', tempat: '', namaMesyuarat: '' });
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MeetingRecord>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.tarikh || !formData.masa || !formData.tempat || !formData.namaMesyuarat) {
      alert("Sila lengkapkan butiran.");
      return;
    }
    onAdd({ ...formData, images });
    setFormData({ tarikh: '', masa: '', tempat: '', namaMesyuarat: '' });
    setImages([]);
  };

  const startEditing = (record: MeetingRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleRemoveImageInternal = (recordId: string, idx: number) => {
    if (window.confirm('Hapus gambar ini daripada rekod?')) {
      onRemoveImage(recordId, idx);
      if (selectedFile?.recordId === recordId && selectedFile?.index === idx) {
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-2xl shadow-lg"><ScrollText size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase">Taklimat / Mesyuarat / Bicara Profesional</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Log Kehadiran & Rekod Perbincangan Profesional</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Log Rekod Baru</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={14} /> Tajuk Taklimat/Mesyuarat</label>
              <input type="text" name="namaMesyuarat" value={formData.namaMesyuarat} onChange={handleInputChange} placeholder="E.G. TAKLIMAT PROFESIONAL BIL 1/2024..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Tarikh</label>
                <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Masa</label>
                <input type="text" name="masa" value={formData.masa} onChange={handleInputChange} placeholder="E.G. 2.30 PM..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Lokasi / Medium</label>
              <input type="text" name="tempat" value={formData.tempat} onChange={handleInputChange} placeholder="E.G. BILIK GERAKAN / ZOOM..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Lampiran Gambar Bukti</label>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-zinc-800 bg-black rounded-2xl shadow-inner">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 text-zinc-700 hover:text-pink-500 transition-all">
                  <Plus size={24} />
                  <span className="text-[8px] font-bold uppercase">Tambah</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
              SIMPAN REKOD PROFESIONAL
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {records.length === 0 ? (
          <div className="text-center py-20 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase font-black">TIADA REKOD DITEMUI</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-10 group relative transition-all duration-300 border-l-4 border-pink-500">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
                <div className="space-y-1 flex-1 w-full">
                  <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest italic">Dokumen Profesional</p>
                  {editingId === record.id ? (
                    <input 
                      value={editForm.namaMesyuarat || ''} 
                      onChange={(e) => setEditForm({...editForm, namaMesyuarat: e.target.value.toUpperCase()})}
                      className="text-2xl font-heading bg-black border border-pink-500 rounded-lg px-4 py-2 w-full text-white uppercase outline-none shadow-[0_0_15px_rgba(255,0,122,0.2)]"
                    />
                  ) : (
                    <h3 className="text-3xl font-heading text-white leading-none uppercase tracking-tighter">{record.namaMesyuarat}</h3>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    {editingId === record.id ? (
                      <>
                        <button onClick={saveEdit} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all"><Check size={20} /></button>
                        <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-white rounded-xl"><X size={20} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(record)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-white rounded-xl transition-all hover:bg-zinc-900"><Edit2 size={18} /></button>
                        <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 transition-all rounded-xl"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-pink-500" />
                    {editingId === record.id ? (
                      <input type="date" value={editForm.tarikh || ''} onChange={(e) => setEditForm({...editForm, tarikh: e.target.value})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                    ) : (
                      record.tarikh
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-pink-500" />
                    {editingId === record.id ? (
                      <input value={editForm.masa || ''} onChange={(e) => setEditForm({...editForm, masa: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                    ) : (
                      record.masa
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-pink-500" />
                    {editingId === record.id ? (
                      <input value={editForm.tempat || ''} onChange={(e) => setEditForm({...editForm, tempat: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                    ) : (
                      record.tempat
                    )}
                  </div>
              </div>

              {record.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {record.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square border border-zinc-900 bg-black group/img cursor-pointer transition-all duration-700 rounded-xl overflow-hidden shadow-md" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
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

export default MeetingManager;
