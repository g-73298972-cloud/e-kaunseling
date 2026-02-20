
import React, { useState, useRef } from 'react';
import { ExternalTrainingRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Calendar, MapPin, Building2, FileText, Eye, MessageSquare, Globe, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface ExternalTrainingManagerProps {
  records: ExternalTrainingRecord[];
  onAdd: (record: Omit<ExternalTrainingRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<ExternalTrainingRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const ExternalTrainingManager: React.FC<ExternalTrainingManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [formData, setFormData] = useState({ namaProgram: '', tarikh: '', tempat: '', anjuran: '' });
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExternalTrainingRecord>>({});
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
    if (!formData.namaProgram || !formData.tarikh || !formData.tempat || !formData.anjuran) {
      alert("Sila lengkapkan butiran program latihan.");
      return;
    }
    onAdd({ ...formData, images });
    setFormData({ namaProgram: '', tarikh: '', tempat: '', anjuran: '' });
    setImages([]);
  };

  const startEditing = (record: ExternalTrainingRecord) => {
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
    if (window.confirm('Hapus gambar bukti ini daripada rekod?')) {
      onRemoveImage(recordId, idx);
      if (selectedFile?.recordId === recordId && selectedFile?.index === idx) {
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b-4 border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center border-2 border-black shadow-lg rounded-2xl rotate-1"><Globe size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none">FRONTIER EXPEDITIONS</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2">EXTERNAL TRAINING JOURNEYS</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 text-center">LOG NEW EXPEDITION</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> EXPEDITION NAME</label>
              <input type="text" name="namaProgram" value={formData.namaProgram} onChange={handleInputChange} placeholder="E.G. REGIONAL COUNSELING SYMPOSIUM..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> DEPARTURE DATE</label>
                <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> DESTINATION</label>
                <input type="text" name="tempat" value={formData.tempat} onChange={handleInputChange} placeholder="E.G. PPD / ZOOM / HOTEL..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Building2 size={14} /> ORGANIZED BY</label>
              <input type="text" name="anjuran" value={formData.anjuran} onChange={handleInputChange} placeholder="E.G. MINISTRY OF EDUCATION / PPD..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ATTACH CERTIFICATES / PROOF</label>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed border-zinc-800 bg-black rounded-2xl">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 border border-zinc-800 rounded-xl overflow-hidden">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md shadow-lg"><X size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 hover:text-pink-500 transition-all text-zinc-800">
                  <Plus size={32} />
                  <span className="text-[8px] font-bold">ADD RECORD</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
              LOG EXPEDITION SUCCESS
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {records.length === 0 ? (
          <div className="col-span-full text-center py-20 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase font-bold">NO EXPEDITIONS LOGGED.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-10 group relative transition-all duration-300 border-l-4 border-white">
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-6">
                <div className="space-y-1 flex-1">
                  <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2 italic"><Globe size={12} /> EXPEDITION DOSSIER</p>
                  {editingId === record.id ? (
                    <input 
                      value={editForm.namaProgram || ''} 
                      onChange={(e) => setEditForm({...editForm, namaProgram: e.target.value.toUpperCase()})}
                      className="text-2xl font-heading bg-black border border-pink-500 rounded-lg px-4 py-2 w-full text-white uppercase outline-none"
                    />
                  ) : (
                    <h3 className="text-2xl font-heading text-white leading-none tracking-tighter uppercase">{record.namaProgram}</h3>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2 ml-4">
                    {editingId === record.id ? (
                      <>
                        <button onClick={saveEdit} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg"><Check size={20} /></button>
                        <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-white rounded-xl"><X size={20} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(record)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-white rounded-xl transition-all hover:bg-zinc-900 shadow-sm"><Edit2 size={18} /></button>
                        <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 transition-all rounded-xl shadow-sm"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-8 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-pink-500 shrink-0"/> 
                  {editingId === record.id ? (
                    <input type="date" value={editForm.tarikh || ''} onChange={(e) => setEditForm({...editForm, tarikh: e.target.value})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                  ) : (
                    record.tarikh
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Building2 size={14} className="text-pink-500 shrink-0"/> 
                  {editingId === record.id ? (
                    <input value={editForm.anjuran || ''} onChange={(e) => setEditForm({...editForm, anjuran: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                  ) : (
                    record.anjuran
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-pink-500 shrink-0"/> 
                  {editingId === record.id ? (
                    <input value={editForm.tempat || ''} onChange={(e) => setEditForm({...editForm, tempat: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded p-1 text-white text-[10px] w-full" />
                  ) : (
                    record.tempat
                  )}
                </div>
              </div>

              {record.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {record.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square border border-zinc-900 rounded-xl bg-black group/img cursor-pointer transition-all duration-700 overflow-hidden shadow-md" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                      {isOwner && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveImageInternal(record.id, idx); }} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 shadow-lg opacity-0 group-hover/img:opacity-100 transition-all rounded-md z-20 hover:scale-110">
                          <Trash2 size={12} />
                        </button>
                      )}
                      {file.comments.length > 0 && <div className="absolute top-1 left-1 bg-pink-500 text-black text-[7px] font-black px-1 py-0.5 rounded-md flex items-center gap-1 shadow-lg"><MessageSquare size={8} /> {file.comments.length}</div>}
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
          onDeleteFile={() => handleRemoveImageInternal(selectedFile.recordId, selectedFile.index)}
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default ExternalTrainingManager;
