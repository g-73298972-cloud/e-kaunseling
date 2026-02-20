
import React, { useState, useRef } from 'react';
import { TeachInRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, ImageIcon, Calendar, Clock, School, FileText, Eye, MessageSquare, Edit2, Check, Upload } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface TeachInManagerProps {
  records: TeachInRecord[];
  onAdd: (record: Omit<TeachInRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<TeachInRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const TeachInManager: React.FC<TeachInManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [formData, setFormData] = useState({ tarikh: '', masa: '', kelas: '', catatan: '' });
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeachInRecord>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, { 
            id: Math.random().toString(36).substr(2, 9), 
            url: reader.result as string, 
            name: file.name.toUpperCase(),
            mimeType: file.type,
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
    if (!formData.tarikh || !formData.masa || !formData.kelas) {
      alert("Sila isi Tarikh, Masa dan Kelas.");
      return;
    }
    onAdd({ ...formData, images });
    setFormData({ tarikh: '', masa: '', kelas: '', catatan: '' }); 
    setImages([]);
  };

  const startEditing = (record: TeachInRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleRemoveFileInternal = (recordId: string, idx: number) => {
    if (window.confirm('Padam fail ini daripada rekod?')) {
      onRemoveImage(recordId, idx);
      if (selectedFile?.recordId === recordId && selectedFile?.index === idx) {
        setSelectedFile(null);
      }
    }
  };

  const handleUpdateFileNameInternal = (recordId: string, idx: number, newName: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    const updatedFile = { ...record.images[idx], name: newName.toUpperCase() };
    onUpdateFile(recordId, idx, updatedFile);
    // Update local edit form if currently editing this record
    if (editingId === recordId) {
        const newImages = [...(editForm.images || [])];
        newImages[idx] = updatedFile;
        setEditForm({ ...editForm, images: newImages });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-3xl shadow-lg"><School size={36} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">Aktiviti Teach-In</h2>
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-[0.3em] mt-2">Log Bimbingan Kelas & Laporan Fail</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> TARIKH</label>
                <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> MASA</label>
                <input type="text" name="masa" value={formData.masa} onChange={handleInputChange} placeholder="E.G. 10.00 AM..." className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><School size={14} /> KELAS</label>
                <input type="text" name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="5 BERLIAN..." className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> CATATAN AKTIVITI</label>
              <textarea name="catatan" value={formData.catatan} onChange={handleInputChange} placeholder="HURAIKAN AKTIVITI..." className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-sm font-bold outline-none min-h-[100px] uppercase text-white focus:border-pink-500" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> MUAT NAIK EVIDENS (IMEJ & PDF)</label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-900 rounded-3xl bg-black shadow-inner">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-28 h-36 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group shadow-lg flex flex-col">
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                      {file.mimeType?.includes('pdf') ? (
                        <FileText size={40} className="text-pink-500" />
                      ) : (
                        <img src={file.url} className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md hover:scale-110 transition-transform shadow-lg"><X size={12} /></button>
                    </div>
                    <div className="bg-zinc-950 p-1.5 border-t border-zinc-800">
                       <p className="text-[7px] font-black text-zinc-500 uppercase truncate text-center px-1">{file.name}</p>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-36 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-pink-500 text-zinc-800 hover:text-pink-500 transition-all bg-zinc-950/40">
                  <Plus size={32} />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-center px-2">TAMBAH FAIL</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" multiple />
            </div>

            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl">
               SIMPAN REKOD TEACH-IN
            </button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {records.length === 0 ? (
          <div className="text-center py-24 text-zinc-800 italic uppercase font-black tracking-widest border-2 border-dashed border-zinc-900 rounded-3xl">Tiada Rekod Teach-In Ditemui</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-8 relative group transition-all duration-500 border-l-4 border-pink-500 shadow-xl hover:border-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
                <div className="flex flex-wrap gap-8">
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">TARIKH</p>
                     {editingId === record.id ? (
                        <input type="date" value={editForm.tarikh || ''} onChange={(e) => setEditForm({...editForm, tarikh: e.target.value})} className="bg-black border border-pink-500/30 rounded px-2 py-1 text-white text-xs font-bold" />
                     ) : (
                        <div className="flex items-center gap-2 font-bold text-white uppercase"><Calendar size={14} className="text-pink-500" />{record.tarikh}</div>
                     )}
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">MASA</p>
                     {editingId === record.id ? (
                        <input value={editForm.masa || ''} onChange={(e) => setEditForm({...editForm, masa: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded px-2 py-1 text-white text-xs font-bold uppercase" />
                     ) : (
                        <div className="flex items-center gap-2 font-bold text-white uppercase"><Clock size={14} className="text-pink-500" />{record.masa}</div>
                     )}
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">KELAS</p>
                     {editingId === record.id ? (
                        <input value={editForm.kelas || ''} onChange={(e) => setEditForm({...editForm, kelas: e.target.value.toUpperCase()})} className="bg-black border border-pink-500/30 rounded px-2 py-1 text-white text-xs font-bold uppercase" />
                     ) : (
                        <div className="flex items-center gap-2 font-bold text-white uppercase"><School size={14} className="text-pink-500" />{record.kelas}</div>
                     )}
                   </div>
                </div>
                {isOwner && (
                  <div className="flex gap-2 relative z-30">
                    {editingId === record.id ? (
                      <>
                        <button onClick={saveEdit} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-white rounded-xl shadow-lg"><X size={18} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(record)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-white rounded-xl transition-all hover:bg-zinc-900 shadow-sm"><Edit2 size={18} /></button>
                        <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 rounded-xl transition-all hover:bg-red-950/30 shadow-sm"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-zinc-950/50 p-6 rounded-2xl border-l-8 border-pink-500 mb-8 shadow-inner border border-zinc-900">
                <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText size={12} /> CATATAN AKTIVITI</p>
                {editingId === record.id ? (
                  <textarea value={editForm.catatan || ''} onChange={(e) => setEditForm({...editForm, catatan: e.target.value.toUpperCase()})} className="w-full bg-black border border-pink-500/30 rounded-xl p-4 text-sm font-bold text-white uppercase outline-none shadow-inner min-h-[100px]" />
                ) : (
                  <p className="text-lg font-bold text-white uppercase leading-relaxed tracking-tight">{record.catatan}</p>
                )}
              </div>

              {record.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {record.images.map((file, idx) => (
                    <div key={idx} className="flex flex-col gap-2 group/img-wrapper">
                      <div className="relative aspect-[3/4] border border-zinc-900 group/img cursor-pointer rounded-2xl overflow-hidden shadow-xl bg-black" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                        {file.mimeType?.includes('pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover/img:bg-zinc-900 transition-colors">
                             <FileText size={48} className="text-pink-500 mb-2" />
                             <span className="text-[8px] font-black text-zinc-500 uppercase truncate w-full px-2">PDF DOCUMENT</span>
                          </div>
                        ) : (
                          <img src={file.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110 opacity-70 group-hover/img:opacity-100" />
                        )}
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <Eye className="text-white" size={24} />
                        </div>

                        {/* Top Controls */}
                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                          {file.comments.length > 0 && (
                            <div className="bg-pink-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg border border-white/10">
                              <MessageSquare size={8} /> {file.comments.length}
                            </div>
                          )}
                        </div>
                        
                        {isOwner && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveFileInternal(record.id, idx); }} 
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 shadow-xl opacity-0 group-hover/img:opacity-100 transition-all rounded-lg hover:scale-110 border border-white/20 z-20"
                            title="Padam Fail"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      {/* Name Label / Edit Input */}
                      {editingId === record.id ? (
                        <div className="space-y-1">
                           <input 
                              value={file.name || ''} 
                              onChange={(e) => handleUpdateFileNameInternal(record.id, idx, e.target.value)}
                              placeholder="NAMA FAIL..."
                              className="w-full bg-zinc-900 border border-pink-500/30 rounded-lg p-1.5 text-[8px] font-bold text-pink-500 uppercase outline-none focus:border-pink-500"
                           />
                           <p className="text-[6px] text-zinc-700 font-black text-center uppercase tracking-widest">Klik Untuk Tukar Nama</p>
                        </div>
                      ) : (
                        file.name && (
                          <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter truncate px-1 text-center group-hover/img-wrapper:text-pink-500 transition-colors">
                            {file.name}
                          </p>
                        )
                      )}
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
          type={selectedFile.file.mimeType?.includes('pdf') ? 'pdf' : 'image'} 
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
          onDeleteFile={() => handleRemoveFileInternal(selectedFile.recordId, selectedFile.index)}
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default TeachInManager;
