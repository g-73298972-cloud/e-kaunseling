
import React, { useState, useRef } from 'react';
import { BureauRecord, SumbanganCategory, FileAttachment } from '../types';
import { Plus, X, Trash2, ImageIcon, Eye, MessageSquare, Briefcase, User, Layers, Upload, Camera } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface BureauManagerProps {
  category: SumbanganCategory;
  records: BureauRecord[];
  onAdd: (record: Omit<BureauRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const BureauManager: React.FC<BureauManagerProps> = ({ category, records, onAdd, onDelete, onRemoveImage, onUpdateFile, isOwner }) => {
  const [jawatankuasa, setJawatankuasa] = useState('');
  const [jawatan, setJawatan] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const incomingFiles = e.target.files;
    if (incomingFiles) {
      Array.from(incomingFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFiles(prev => [...prev, {
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
    if (!jawatankuasa.trim() || !jawatan.trim()) {
      alert("Sila masukkan maklumat Jawatankuasa dan Jawatan.");
      return;
    }
    onAdd({ category, jawatankuasa: jawatankuasa.toUpperCase(), jawatan: jawatan.toUpperCase(), files });
    setJawatankuasa('');
    setJawatan('');
    setFiles([]);
  };

  const categoryIcon = () => {
    switch (category) {
      case 'KURIKULUM': return <Layers size={28} />;
      case 'KOKURIKULUM': return <ImageIcon size={28} />;
      case 'HAL EHWAL MURID': return <User size={28} />;
      default: return <Briefcase size={28} />;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-14 h-14 bg-pink-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,122,0.3)]">
          {categoryIcon()}
        </div>
        <div>
          <h2 className="text-3xl font-heading text-white leading-none uppercase">PENGURUSAN {category}</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2 italic">Arkib Perjawatan & Jawatankuasa Rasmi</p>
        </div>
      </div>

      {isOwner && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <div className="flex items-center gap-3 mb-8">
            <Plus size={18} className="text-pink-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Daftar Jawatankuasa Baru</h4>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">Nama Jawatankuasa</label>
                <input
                  type="text"
                  value={jawatankuasa}
                  onChange={(e) => setJawatankuasa(e.target.value)}
                  placeholder="CONTOH: JK JADUAL WAKTU / JK KANTIN..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">Jawatan</label>
                <input
                  type="text"
                  value={jawatan}
                  onChange={(e) => setJawatan(e.target.value)}
                  placeholder="CONTOH: SETIAUSAHA / AJK..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Camera size={14}/> Lampiran Gambar (Tanpa Had)</label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-800 rounded-2xl bg-black">
                {files.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800 group shadow-lg">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md shadow-lg hover:scale-110 transition-transform"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-pink-500 transition-all text-zinc-700 hover:text-pink-500 group">
                  <Upload size={28} />
                  <span className="text-[8px] font-black uppercase">Add Photo</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 px-10 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-4">
               Simpan Rekod {category}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {records.length === 0 ? (
          <div className="text-center py-24 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase">TIADA REKOD {category} DISIMPAN.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-8 group relative border-l-4 border-pink-500 transition-all duration-300">
              <div className="flex justify-between items-start mb-6 border-b border-zinc-900 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tighter mb-1">{record.jawatankuasa}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[9px] font-black uppercase tracking-widest">
                    <Briefcase size={10} /> Jawatan: {record.jawatan}
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-900 text-zinc-800 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              {record.files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {record.files.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-900 bg-black group/img cursor-pointer" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                      {file.comments.length > 0 && (
                        <div className="absolute top-2 left-2 bg-pink-500 text-black text-[8px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
                          <MessageSquare size={8} /> {file.comments.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-right">
                <span className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest italic">
                  Diarkibkan pada {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
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

export default BureauManager;
