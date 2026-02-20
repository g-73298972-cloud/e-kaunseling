
import React, { useState, useRef } from 'react';
import { ProgramRecord, FocusArea, FileAttachment } from '../types';
import { Trash2, Calendar, FileText, ImageIcon, HeartHandshake, X, Eye, Edit2, Check, MapPin, Users, Plus, Upload, ShieldAlert } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface ProgramListProps {
  records: ProgramRecord[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<ProgramRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  showFocus?: boolean;
  isOwner: boolean;
}

const ProgramList: React.FC<ProgramListProps> = ({ records, onDelete, onUpdate, onRemoveImage, onUpdateFile, showFocus = false, isOwner }) => {
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProgramRecord>>({});
  const editFileInputRef = useRef<HTMLInputElement>(null);

  if (records.length === 0) {
    return (
      <div className="p-20 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/20">
        <div className="mx-auto w-24 h-24 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
          <FileText size={40} className="text-zinc-800" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.5em] text-zinc-700">Arkib Kosong</p>
      </div>
    );
  }

  const startEditing = (record: ProgramRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleFullDelete = (id: string, name: string) => {
    if (window.confirm(`ADAKAH ANDA PASTI UNTUK MEMADAM REKOD "${name}" SECARA KEKAL DARI ARKIB?`)) {
      onDelete(id);
    }
  };

  const handleLocalRemoveImage = (idx: number) => {
    if(window.confirm('Padam evidens ini?')) {
      setEditForm(prev => ({
        ...prev,
        oprImages: prev.oprImages?.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleAddImageInEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name.toUpperCase(),
            mimeType: file.type,
            comments: [],
            reactions: []
          };
          setEditForm(prev => ({
            ...prev,
            oprImages: [...(prev.oprImages || []), newFile]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="grid grid-cols-1 gap-12">
      {records.map((record) => (
        <div 
          key={record.id} 
          className={`bp-card p-10 group relative transition-all duration-500 overflow-hidden border-l-8 ${
            editingId === record.id 
              ? 'border-pink-500 bg-pink-500/5 shadow-[0_0_50px_rgba(255,0,122,0.15)]' 
              : 'border-zinc-800 hover:border-pink-500/50 shadow-2xl'
          }`}
        >
          {/* Action Overlay for Admin */}
          {isOwner && (
            <div className="absolute top-6 right-6 flex gap-3 z-30">
              {editingId === record.id ? (
                <>
                  <button onClick={saveEdit} title="Simpan Perubahan" className="w-12 h-12 flex items-center justify-center text-black bg-emerald-500 rounded-2xl transition-all shadow-lg hover:scale-110"><Check size={24} strokeWidth={3} /></button>
                  <button onClick={() => setEditingId(null)} title="Batal" className="w-12 h-12 flex items-center justify-center text-white bg-zinc-800 rounded-2xl transition-all hover:bg-zinc-700"><X size={24} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(record)} title="Sunting Rekod" className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white border-2 border-zinc-900 bg-black/40 rounded-2xl transition-all hover:border-pink-500/50 hover:scale-110"><Edit2 size={20} /></button>
                  <button onClick={() => handleFullDelete(record.id, record.namaProgram)} title="Padam Rekod" className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-red-500 border-2 border-zinc-900 bg-black/40 rounded-2xl transition-all hover:bg-red-950/30 hover:scale-110"><Trash2 size={20} /></button>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {showFocus && (
                  <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${getFocusStyles(record.focusArea)}`}>
                    {record.focusArea}
                  </span>
                )}
                {editingId === record.id ? (
                   <input 
                     className="text-3xl font-heading bg-black border-2 border-pink-500 rounded-2xl px-6 py-4 text-white w-full uppercase outline-none shadow-[0_0_20px_rgba(255,0,122,0.1)]"
                     value={editForm.namaProgram || ''}
                     onChange={(e) => setEditForm({...editForm, namaProgram: e.target.value.toUpperCase()})}
                     placeholder="NAMA PROGRAM..."
                   />
                ) : (
                  <h4 className="text-4xl md:text-5xl font-heading text-white tracking-tighter leading-none uppercase">
                    {record.namaProgram}
                  </h4>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Field Mapping */}
                {[
                  { icon: <Calendar size={18} />, label: 'Tarikh', val: editingId === record.id ? 
                    <div className="space-y-2">
                       <input type="date" className="bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] w-full" value={editForm.tarikhMula || ''} onChange={(e) => setEditForm({...editForm, tarikhMula: e.target.value})} />
                       <input type="date" className="bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] w-full" value={editForm.tarikhTamat || ''} onChange={(e) => setEditForm({...editForm, tarikhTamat: e.target.value})} />
                    </div> : `${record.tarikhMula} - ${record.tarikhTamat}` 
                  },
                  { icon: <MapPin size={18} />, label: 'Tempat', val: editingId === record.id ? 
                    <input className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs w-full uppercase" value={editForm.tempat || ''} onChange={(e) => setEditForm({...editForm, tempat: e.target.value.toUpperCase()})} /> : (record.tempat || '-') 
                  },
                  { icon: <Users size={18} />, label: 'Sasaran', val: editingId === record.id ? 
                    <input className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs w-full uppercase" value={editForm.sasaran || ''} onChange={(e) => setEditForm({...editForm, sasaran: e.target.value.toUpperCase()})} /> : (record.sasaran || '-') 
                  },
                  { icon: <HeartHandshake size={18} />, label: 'Penyelaras', val: editingId === record.id ? 
                    <div className="space-y-2">
                      <input className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs w-full uppercase" value={editForm.penyelaras || ''} onChange={(e) => setEditForm({...editForm, penyelaras: e.target.value.toUpperCase()})} />
                      <select className="bg-zinc-900 border border-zinc-800 rounded p-1 text-[10px] w-full" value={editForm.sumbangan || 'PENYELARAS'} onChange={(e) => setEditForm({...editForm, sumbangan: e.target.value})}>
                        <option value="PENYELARAS">PENYELARAS</option>
                        <option value="PENGENDALI SLOT">PENGENDALI SLOT</option>
                        <option value="AJK">AJK</option>
                      </select>
                    </div> : `${record.penyelaras} (${record.sumbangan})` 
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800 text-pink-500">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">{item.label}</p>
                      <div className="text-sm font-bold text-white uppercase truncate">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Gallery */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] flex items-center gap-2">
                <ImageIcon size={14} className="text-pink-500" /> Arkib Evidens Visual & PDF
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {(editingId === record.id ? editForm.oprImages : record.oprImages)?.map((file, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-zinc-900 bg-black group/img shadow-xl transition-all hover:border-pink-500/50">
                    <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                        {file.mimeType?.includes('pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-950 text-center">
                            <FileText size={48} className="text-pink-500 mb-2" />
                            <span className="text-[8px] font-black text-zinc-600 uppercase truncate w-full px-2">Dokumen PDF</span>
                          </div>
                        ) : (
                          <img src={file.url} className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 opacity-70 group-hover/img:opacity-100" />
                        )}
                    </div>
                    
                    {isOwner && editingId === record.id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLocalRemoveImage(idx); }} 
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl shadow-2xl hover:scale-110 transition-all border border-white/20 z-10"
                        title="Padam Fail Ini"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Eye className="text-white shadow-xl" size={32} />
                    </div>
                  </div>
                ))}

                {/* Add Evidence during edit */}
                {editingId === record.id && (
                  <button 
                    onClick={() => editFileInputRef.current?.click()}
                    className="aspect-[3/4] border-3 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-zinc-800 hover:text-pink-500 hover:border-pink-500/50 transition-all bg-zinc-950/40 group/add"
                  >
                    <Plus size={40} className="group-hover/add:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tambah Fail</span>
                  </button>
                )}
              </div>
              {editingId === record.id && (
                 <input type="file" ref={editFileInputRef} onChange={handleAddImageInEdit} className="hidden" accept="image/*,.pdf" multiple />
              )}
            </div>
          </div>
        </div>
      ))}

      {selectedFile && (
        <FileViewModal 
          file={selectedFile.file} 
          type={selectedFile.file.mimeType?.includes('pdf') ? 'pdf' : 'image'} 
          onClose={() => setSelectedFile(null)} 
          onAddComment={()=>{}} 
          onDeleteComment={()=>{}} 
          onAddReaction={()=>{}} 
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

const getFocusStyles = (focus: FocusArea) => {
  switch (focus) {
    case FocusArea.SAHSIAH: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case FocusArea.DISIPLIN: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case FocusArea.KERJAYA: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case FocusArea.PSIKOSOSIAL: return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
};

export default ProgramList;
