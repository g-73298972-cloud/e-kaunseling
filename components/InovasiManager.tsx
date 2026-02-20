
import React, { useState, useRef } from 'react';
import { InovasiRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Eye, Lightbulb, FileText, Upload, Edit2, Check, RefreshCcw, FileSearch } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface InovasiManagerProps {
  records: InovasiRecord[];
  onAdd: (record: Omit<InovasiRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<InovasiRecord>) => void;
  onRemoveFile: (recordId: string, fileId: string) => void;
  onUpdateFile: (recordId: string, index: number, updatedFile: FileAttachment) => void;
  onClearAll?: () => void;
  isOwner: boolean;
}

const InovasiManager: React.FC<InovasiManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveFile, onUpdateFile, onClearAll, isOwner }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InovasiRecord>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    if (!isOwner) return;
    const incomingFiles = e.target.files;
    if (incomingFiles) {
      Array.from(incomingFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const attachment: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name.toUpperCase(),
            mimeType: file.type,
            comments: [],
            reactions: []
          };
          if (isEditing) {
            setEditForm(prev => ({ ...prev, files: [...(prev.files || []), attachment] }));
          } else {
            setFiles(prev => [...prev, attachment]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveFileInternal = (e: React.MouseEvent, recordId: string, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Padam fail ini secara kekal?')) {
      if (editingId === recordId) {
        setEditForm(prev => ({
          ...prev,
          files: (prev.files || []).filter(f => f.id !== fileId)
        }));
      } else {
        onRemoveFile(recordId, fileId);
      }
      if (selectedFile?.file.id === fileId) setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.toUpperCase(),
      description: description.toUpperCase(),
      files
    });
    setTitle('');
    setDescription('');
    setFiles([]);
  };

  const startEditing = (record: InovasiRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (editingId && editForm.title) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="flex items-center gap-6">
          <div className="bg-pink-500 p-4 rounded-3xl text-black shadow-lg shadow-pink-500/20">
            <Lightbulb size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">Kajian & Inovasi</h2>
            <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] mt-2 italic">Pengurusan Rekod & Amalan Terbaik</p>
          </div>
        </div>
        
        {isOwner && records.length > 0 && (
          <div className="flex gap-3">
             <button 
                onClick={onClearAll}
                className="flex items-center gap-3 px-6 py-3 border-2 border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase tracking-widest bg-black/40 shadow-xl"
              >
                <RefreshCcw size={16} /> RESET / PADAM SEMUA
              </button>
          </div>
        )}
      </div>

      {/* Form Input Section */}
      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/40 border-l-4 border-pink-500 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Plus size={20} className="text-pink-500" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Daftar Inovasi/Amalan Baru</h4>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Nama Kajian / Inovasi / Amalan</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="TAIP TAJUK DI SINI..." 
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-pink-500 outline-none uppercase shadow-inner transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Penerangan Ringkas</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="HURAIKAN SECARA RINGKAS..." 
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-pink-500 outline-none uppercase shadow-inner min-h-[100px] transition-all" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} /> Muat Naik Evidens (PNG, JPG, GIF, PDF)
              </label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-900 bg-black/40 rounded-[2rem]">
                {files.map(f => (
                  <div key={f.id} className="relative w-24 h-24 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group shadow-lg">
                    {f.mimeType?.includes('pdf') ? (
                      <div className="w-full h-full flex items-center justify-center"><FileText size={32} className="text-pink-500"/></div>
                    ) : (
                      <img src={f.url} className="w-full h-full object-cover opacity-80" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => setFiles(prev => prev.filter(file => file.id !== f.id))} 
                      className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg z-20 hover:scale-110 transition-all border border-white/20 shadow-xl"
                    >
                      <X size={12}/>
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 text-zinc-700 hover:border-pink-500 hover:text-pink-500 transition-all bg-zinc-950/50"
                >
                  <Plus size={32} />
                  <span className="text-[8px] font-black uppercase">Add File</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} className="hidden" accept="image/png, image/jpeg, image/gif, application/pdf" multiple />
            </div>
            
            <button type="submit" className="w-full btn-pink py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-pink-500/10 active:scale-95 transition-all">
              SIMPAN REKOD INOVASI
            </button>
          </form>
        </div>
      )}

      {/* List Section */}
      <div className="grid grid-cols-1 gap-10">
        {records.length === 0 ? (
          <div className="py-32 text-center bp-card border-dashed bg-transparent flex flex-col items-center justify-center gap-4">
             <FileSearch size={64} className="text-zinc-900" />
             <p className="text-zinc-800 italic font-black uppercase tracking-[0.5em] text-xs">Pangkalan Data Kosong</p>
          </div>
        ) : (
          records.map(record => (
            <div key={record.id} className={`bp-card p-10 relative overflow-hidden transition-all duration-500 border-l-4 ${editingId === record.id ? 'border-pink-500 bg-pink-500/5 shadow-[0_0_30px_rgba(255,0,122,0.1)]' : 'border-zinc-800 shadow-xl'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 border-b border-zinc-900 pb-8">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-pink-500/20">Arkib Inovasi</span>
                     <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {editingId === record.id ? (
                    <div className="space-y-4">
                      <input 
                        value={editForm.title || ''} 
                        onChange={(e) => setEditForm({...editForm, title: e.target.value.toUpperCase()})} 
                        className="text-2xl font-heading bg-black border border-pink-500 rounded-xl px-4 py-2 w-full text-white uppercase outline-none shadow-pink" 
                      />
                      <textarea 
                        value={editForm.description || ''} 
                        onChange={(e) => setEditForm({...editForm, description: e.target.value.toUpperCase()})} 
                        className="text-sm bg-black border border-pink-500 rounded-xl px-4 py-2 w-full text-zinc-400 uppercase outline-none min-h-[80px]" 
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-3xl font-heading text-white uppercase tracking-tighter leading-none mb-3">{record.title}</h4>
                      <p className="text-zinc-500 text-sm font-bold uppercase leading-relaxed max-w-4xl">{record.description}</p>
                    </>
                  )}
                </div>
                
                {isOwner && (
                  <div className="flex gap-2">
                    {editingId === record.id ? (
                      <>
                        <button onClick={saveEdit} className="w-12 h-12 bg-emerald-500 text-black rounded-2xl flex items-center justify-center hover:scale-110 shadow-lg"><Check size={24} strokeWidth={3} /></button>
                        <button onClick={() => setEditingId(null)} className="w-12 h-12 bg-zinc-800 text-white rounded-2xl flex items-center justify-center hover:scale-110"><X size={24} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(record)} className="w-11 h-11 border-2 border-zinc-800 text-zinc-600 hover:text-white hover:border-white transition-all rounded-xl flex items-center justify-center" title="Edit Tajuk/Teks"><Edit2 size={18}/></button>
                        <button onClick={() => onDelete(record.id)} className="w-11 h-11 border-2 border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500 transition-all rounded-xl flex items-center justify-center" title="Padam Seluruh Rekod"><Trash2 size={18}/></button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                {(editingId === record.id ? (editForm.files || []) : record.files).map((file, idx) => (
                  <div key={file.id} className="relative group rounded-3xl overflow-hidden border border-zinc-900 bg-black aspect-square shadow-2xl transition-all hover:border-pink-500/50">
                    {file.mimeType?.includes('pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-4 text-center">
                        <FileText size={48} className="text-pink-500 mb-2"/>
                        <span className="text-[7px] font-black text-zinc-600 uppercase truncate w-full px-2">{file.name}</span>
                      </div>
                    ) : (
                      <img src={file.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    )}
                    
                    {/* Control Buttons - Berubah mengikut mod suntingan */}
                    <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity z-50 ${editingId === record.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isOwner && (
                        <button 
                          onClick={(e) => handleRemoveFileInternal(e, record.id, file.id)} 
                          className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 border border-white/20 transition-all"
                          title="Padam Imej/Fail Ini"
                        >
                          <Trash2 size={18}/>
                        </button>
                      )}
                      {!editingId && (
                        <button 
                          onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })} 
                          className="w-10 h-10 bg-pink-500 text-black rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                          title="Besarkan Gambar"
                        >
                          <Eye size={18}/>
                        </button>
                      )}
                    </div>
                    
                    {!editingId && file.name && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-2 text-center transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[7px] font-black text-white uppercase truncate">{file.name}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {editingId === record.id && (
                  <button 
                    type="button" 
                    onClick={() => editFileInputRef.current?.click()} 
                    className="aspect-square border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-700 hover:text-pink-500 transition-all hover:bg-zinc-900/50 gap-2"
                  >
                    <Plus size={32}/>
                    <span className="text-[9px] font-black uppercase">Tambah Gambar</span>
                  </button>
                )}
              </div>
              
              {editingId === record.id && (
                 <div className="mt-8 flex justify-end">
                    <p className="text-[10px] font-black text-pink-500/50 uppercase italic tracking-widest flex items-center gap-2">
                       <Check size={12} /> Klik butang hijau di atas untuk simpan semua perubahan imej
                    </p>
                 </div>
              )}
              
              {editingId === record.id && <input type="file" ref={editFileInputRef} onChange={(e) => handleFileUpload(e, true)} className="hidden" accept="image/*,application/pdf" multiple />}
            </div>
          ))
        )}
      </div>

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

export default InovasiManager;
