
import React, { useState, useRef } from 'react';
import { BilikRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, ImageIcon, Eye, MessageSquare, Home, Sparkles, Camera, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface BilikManagerProps {
  records: BilikRecord[];
  onAdd: (record: Omit<BilikRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<BilikRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const BilikManager: React.FC<BilikManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
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
          setImages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name.toUpperCase(),
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
    if (!caption.trim() && images.length === 0) {
      alert("Sila masukkan kapsyen atau lampiran visual.");
      return;
    }
    onAdd({ caption: caption.toUpperCase(), images });
    setCaption('');
    setImages([]);
  };

  const startEditing = (record: BilikRecord) => {
    setEditingId(record.id);
    setEditCaption(record.caption);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, { caption: editCaption.toUpperCase() });
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
    <div className="space-y-10">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-14 h-14 bg-pink-500 text-black rounded-2xl flex items-center justify-center shadow-lg"><Home size={28} strokeWidth={3} /></div>
        <div>
          <h2 className="text-3xl font-heading text-white leading-none">PENGURUSAN BILIK B&K</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Dokumentasi Persekitaran & Infrastruktur</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <div className="flex items-center gap-3 mb-8">
            <Camera size={18} className="text-pink-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Daftar Visual Baru</h4>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">Keterangan Sudut Bilik</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.toUpperCase())}
                placeholder="CONTOH: SUDUT PSIKOMETRIK / BILIK KAUNSELING INDIVIDU..."
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-pink-500 outline-none transition-all min-h-[120px] uppercase text-white shadow-inner"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">Lampiran Imej</label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-800 rounded-2xl bg-black">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-800 group">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md shadow-lg hover:scale-110 transition-transform"><X size={10} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 transition-all text-zinc-800 hover:text-pink-500 group">
                  <Plus size={28} />
                  <span className="text-[8px] font-black uppercase">Upload</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-4">
               SIMPAN REKOD BILIK
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.length === 0 ? (
          <div className="col-span-full text-center py-20 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase">No visual records found.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-8 group relative overflow-hidden border-l-4 border-pink-500 transition-all">
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                  <div className="flex-1 mr-4">
                    <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Sparkles size={12} strokeWidth={3} /> Visual Data</p>
                    {editingId === record.id ? (
                      <textarea 
                        value={editCaption} 
                        onChange={(e) => setEditCaption(e.target.value.toUpperCase())}
                        className="w-full bg-black border border-pink-500 rounded-lg p-2 text-sm font-bold text-white uppercase outline-none"
                      />
                    ) : (
                      <p className="text-lg font-bold text-white leading-tight uppercase tracking-tighter">{record.caption}</p>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      {editingId === record.id ? (
                        <>
                          <button onClick={saveEdit} className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-black rounded-lg hover:scale-110 transition-all shadow-lg"><Check size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="w-9 h-9 flex items-center justify-center bg-zinc-800 text-white rounded-lg"><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(record)} className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-white transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => onDelete(record.id)} className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {record.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {record.images.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-900 bg-black group/img cursor-pointer" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                        <img src={file.url} className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 opacity-70 group-hover/img:opacity-100" />
                        <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={20} /></div>
                        {isOwner && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveImageInternal(record.id, idx); }} 
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md shadow-xl opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 z-10"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        {file.comments.length > 0 && (
                          <div className="absolute bottom-1 left-1 bg-pink-500 text-black text-[7px] font-black px-1 rounded-sm shadow-lg flex items-center gap-0.5">
                             <MessageSquare size={7} /> {file.comments.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedFile && <FileViewModal file={selectedFile.file} type="image" onClose={() => setSelectedFile(null)} onAddComment={(t, u) => {
        const updated = { ...selectedFile.file };
        updated.comments = [...updated.comments, { id: Math.random().toString(36).substr(2, 9), userName: u, text: t, timestamp: Date.now() }];
        onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
        setSelectedFile({ ...selectedFile, file: updated });
      }} onDeleteComment={(cid) => {
        const updated = { ...selectedFile.file };
        updated.comments = updated.comments.filter(c => c.id !== cid);
        onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
        setSelectedFile({ ...selectedFile, file: updated });
      }} onAddReaction={(e) => {
        const updated = { ...selectedFile.file };
        const ridx = updated.reactions.findIndex(r => r.emoji === e);
        if (ridx > -1) updated.reactions[ridx].count += 1; else updated.reactions.push({ emoji: e, count: 1 });
        onUpdateFile(selectedFile.recordId, selectedFile.index, updated);
        setSelectedFile({ ...selectedFile, file: updated });
      }} onDeleteFile={() => handleRemoveImageInternal(selectedFile.recordId, selectedFile.index)} isOwner={isOwner} />}
    </div>
  );
};

export default BilikManager;
