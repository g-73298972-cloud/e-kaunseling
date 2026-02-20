
import React, { useState, useRef } from 'react';
import { AssemblyRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Calendar, Clock, FileText, Eye, MessageSquare, Megaphone, Edit2, Check, List } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface AssemblyManagerProps {
  records: AssemblyRecord[];
  onAdd: (record: Omit<AssemblyRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<AssemblyRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const AssemblyManager: React.FC<AssemblyManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [formData, setFormData] = useState({ tarikh: '', masa: '', catatan: '' });
  const [images, setImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AssemblyRecord>>({});
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
    if (!formData.tarikh || !formData.masa) {
      alert("SILA MASUKKAN TARIKH DAN MASA.");
      return;
    }
    onAdd({ ...formData, images });
    setFormData({ tarikh: '', masa: '', catatan: '' });
    setImages([]);
  };

  const startEditing = (record: AssemblyRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEditedRecord = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
      setEditForm({});
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

  // Komponen Bunga Matahari untuk Bullet
  const SunflowerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-1 transition-transform duration-500 group-hover/line:rotate-45">
      {/* Kelopak Kuning */}
      <path d="M12 2L13.5 7H10.5L12 2Z" fill="#FACC15"/>
      <path d="M12 22L10.5 17H13.5L12 22Z" fill="#FACC15"/>
      <path d="M22 12L17 13.5V10.5L22 12Z" fill="#FACC15"/>
      <path d="M2 12L7 10.5V13.5L2 12Z" fill="#FACC15"/>
      <path d="M19.07 4.93L15.53 8.47L13.41 6.35L19.07 4.93Z" fill="#FACC15"/>
      <path d="M4.93 19.07L8.47 15.53L6.35 13.41L4.93 19.07Z" fill="#FACC15"/>
      <path d="M19.07 19.07L15.53 15.53L17.65 13.41L19.07 19.07Z" fill="#FACC15"/>
      <path d="M4.93 4.93L8.47 8.47L6.35 10.59L4.93 4.93Z" fill="#FACC15"/>
      {/* Pusat Hijau */}
      <circle cx="12" cy="12" r="5" fill="#22C55E" stroke="#166534" strokeWidth="1"/>
    </svg>
  );

  // Fungsi untuk memaparkan teks dengan bullet dan numbering
  const renderFormattedNotes = (text: string) => {
    if (!text) return <p className="text-zinc-500 italic">TIADA CATATAN</p>;
    
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Deteksi Bullet (bermula dengan - atau *)
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <div key={i} className="flex gap-4 ml-2 mb-3 group/line items-start">
            <SunflowerIcon />
            <span className="text-white text-lg font-bold uppercase leading-tight pt-0.5">{trimmed.substring(1).trim()}</span>
          </div>
        );
      }
      
      // Deteksi Numbering (bermula dengan nombor dan titik, cth: 1.)
      const numberMatch = trimmed.match(/^(\d+)\./);
      if (numberMatch) {
        const num = numberMatch[1];
        const rest = trimmed.substring(num.length + 1).trim();
        return (
          <div key={i} className="flex gap-3 ml-4 mb-3 items-start">
            <span className="text-pink-500 font-black flex-shrink-0 text-xl">{num}.</span>
            <span className="text-white text-lg font-bold uppercase leading-tight pt-1">{rest}</span>
          </div>
        );
      }
      
      // Teks biasa
      return line.length > 0 ? (
        <p key={i} className="text-lg font-bold text-white uppercase leading-relaxed mb-4">{line}</p>
      ) : (
        <div key={i} className="h-4" /> // Baris kosong
      );
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-2xl shadow-lg"><Megaphone size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none">Rekod Perhimpunan</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Arkib Perhimpunan Mingguan</p>
        </div>
      </div>

      {isOwner && (
        <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Daftar Rekod Baru</h4>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Tarikh</label>
                <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Masa</label>
                <input type="text" name="masa" value={formData.masa} onChange={handleInputChange} placeholder="CONTOH: 7.30 - 8.10 AM" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none uppercase text-white focus:border-pink-500" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Catatan / Laporan</label>
              <textarea 
                name="catatan" 
                value={formData.catatan} 
                onChange={handleInputChange} 
                placeholder="TAIP CATATAN... (GUNAKAN '-' UNTUK BULLET BUNGA MATAHARI)" 
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none min-h-[150px] uppercase text-white focus:border-pink-500" 
              />
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2"><List size={10} className="text-pink-500" /> Tip: Mulakan baris dengan '-' untuk melihat bunga matahari.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Muat Naik Gambar</label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-800 bg-black rounded-2xl">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-24 h-24 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                    <img src={file.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md hover:scale-110 transition-transform"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 text-zinc-700 hover:text-pink-500 transition-all">
                  <Plus size={32} />
                  <span className="text-[8px] font-bold uppercase">Tambah</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-xl font-bold tracking-widest uppercase shadow-xl">
              Simpan Rekod Perhimpunan
            </button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {records.length === 0 ? (
          <div className="text-center py-20 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase font-black">Tiada rekod perhimpunan diarkibkan.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card p-10 group relative transition-all duration-300 border-l-4 border-pink-500 shadow-xl hover:border-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
                <div className="flex flex-wrap gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tarikh</p>
                    {editingId === record.id ? (
                      <input type="date" value={editForm.tarikh || ''} onChange={(e) => setEditForm({...editForm, tarikh: e.target.value})} className="bg-black border-2 border-pink-500 rounded-lg p-2 text-white text-xs font-bold outline-none" />
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-white"><Calendar size={18} className="text-pink-500" />{record.tarikh}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Masa</p>
                    {editingId === record.id ? (
                      <input type="text" value={editForm.masa || ''} onChange={(e) => setEditForm({...editForm, masa: e.target.value.toUpperCase()})} className="bg-black border-2 border-pink-500 rounded-lg p-2 text-white text-xs font-bold uppercase outline-none" />
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-white"><Clock size={18} className="text-pink-500" />{record.masa}</div>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <div className="flex gap-3 relative z-30">
                    {editingId === record.id ? (
                      <>
                        <button onClick={saveEditedRecord} className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg font-black"><Check size={24} /></button>
                        <button onClick={() => setEditingId(null)} className="w-12 h-12 flex items-center justify-center bg-zinc-800 text-white rounded-xl hover:scale-110 transition-all shadow-lg"><X size={24} /></button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(record)} 
                          className="w-12 h-12 flex items-center justify-center border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black transition-all rounded-xl shadow-md bg-black/60"
                          title="Sunting Rekod"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(record.id); }} 
                          className="w-12 h-12 flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-md bg-black/60 pointer-events-auto"
                          title="Hapus Rekod"
                        >
                          <Trash2 size={22} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-zinc-950/50 p-8 rounded-2xl border-l-8 border-pink-500 mb-8 shadow-inner border border-zinc-900">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={12}/> Catatan Rasmi</p>
                {editingId === record.id ? (
                  <textarea 
                    value={editForm.catatan || ''} 
                    onChange={(e) => setEditForm({...editForm, catatan: e.target.value.toUpperCase()})} 
                    className="w-full bg-black border-2 border-pink-500 rounded-xl p-4 text-sm font-bold text-white uppercase outline-none min-h-[150px]" 
                  />
                ) : (
                  <div className="space-y-1">
                    {renderFormattedNotes(record.catatan)}
                  </div>
                )}
              </div>

              {record.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {record.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square border border-zinc-900 bg-black group/img cursor-pointer transition-all duration-700 rounded-xl overflow-hidden shadow-md" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                      <img src={file.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110 opacity-70 group-hover/img:opacity-100" />
                      <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                      {isOwner && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveImageInternal(record.id, idx); }} 
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 shadow-xl opacity-0 group-hover/img:opacity-100 transition-all rounded-lg hover:scale-110 border border-white/20"
                          title="Hapus Gambar Sahaja"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {file.comments.length > 0 && <div className="absolute top-2 left-2 bg-pink-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg"><MessageSquare size={8} /> {file.comments.length}</div>}
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

export default AssemblyManager;
