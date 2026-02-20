
import React, { useState, useRef } from 'react';
import { SuccessFormRecord, FileAttachment } from '../types';
import { Plus, X, Trash2, Eye, FileCheck, FileText, Edit2, Check, Upload } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface SuccessFormManagerProps {
  records: SuccessFormRecord[];
  onAdd: (record: Omit<SuccessFormRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onRemoveImage: (recordId: string, fileId: string) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  onUpdate: (id: string, updated: Partial<SuccessFormRecord>) => void;
  isOwner: boolean;
}

const SuccessFormManager: React.FC<SuccessFormManagerProps> = ({ records, onAdd, onDelete, onRemoveImage, onUpdateFile, onUpdate, isOwner }) => {
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SuccessFormRecord>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    if (!isOwner) return;
    const incomingFiles = e.target.files;
    if (incomingFiles) {
      Array.from(incomingFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const attachment: FileAttachment = { id: Math.random().toString(36).substr(2, 9), url: reader.result as string, name: file.name.toUpperCase(), mimeType: file.type, comments: [], reactions: [] };
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
        setEditForm(prev => ({ ...prev, files: (prev.files || []).filter(f => f.id !== fileId) }));
      } else {
        onRemoveImage(recordId, fileId);
      }
      if (selectedFile?.file.id === fileId) setSelectedFile(null);
    }
  };

  const saveEdit = () => {
    if (editingId && editForm.title) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-6">
        <div className="bg-pink-500 p-4 rounded-2xl text-black shadow-lg shadow-pink-500/20"><FileCheck size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase">Rekod Keberhasilan</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Daftar Kejayaan & Pencapaian Cikgu Lily</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <form onSubmit={(e) => { e.preventDefault(); if(caption.trim()){ onAdd({title: caption.toUpperCase(), files}); setCaption(''); setFiles([]); } }} className="space-y-6">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="KAPSYEN KEBERHASILAN / PENCAPAIAN..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold uppercase text-white outline-none focus:border-pink-500 min-h-[100px]" />
            <div className="flex flex-wrap gap-3 p-4 border-2 border-dashed border-zinc-800 rounded-xl">
              {files.map(f => (
                <div key={f.id} className="relative w-24 h-24 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group">
                  {f.mimeType?.includes('pdf') ? <div className="w-full h-full flex items-center justify-center"><FileText size={32} className="text-pink-500"/></div> : <img src={f.url} className="w-full h-full object-cover" />}
                  <button type="button" onClick={() => setFiles(prev => prev.filter(file => file.id !== f.id))} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md z-20 hover:scale-110 transition-transform"><X size={12}/></button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 hover:text-pink-500 transition-all">
                <Plus size={32} />
                <span className="text-[8px] font-black uppercase">TAMBAH</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} className="hidden" accept="image/*,application/pdf" multiple />
            <button type="submit" className="w-full btn-pink py-4 rounded-xl font-black uppercase text-xs">SIMPAN BORANG</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {records.map(record => (
          <div key={record.id} className={`bp-card p-10 relative border-l-4 ${editingId === record.id ? 'border-pink-500' : 'border-white'} shadow-xl transition-all`}>
            <div className="flex justify-between items-start mb-6 border-b border-zinc-900 pb-4">
              <div className="flex-1 pr-6">
                {editingId === record.id ? (
                  <textarea value={editForm.title || ''} onChange={(e) => setEditForm({...editForm, title: e.target.value.toUpperCase()})} className="font-heading text-xl bg-black border border-pink-500 rounded-lg p-2 w-full text-white min-h-[60px]" />
                ) : (
                  <h4 className="font-heading text-2xl text-white uppercase">{record.title}</h4>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  {editingId === record.id ? (
                    <><button onClick={saveEdit} className="w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:scale-110 transition-all"><Check/></button><button onClick={() => setEditingId(null)} className="w-10 h-10 bg-zinc-800 text-white rounded-xl flex items-center justify-center"><X/></button></>
                  ) : (
                    <><button onClick={() => { setEditingId(record.id); setEditForm(record); }} className="w-10 h-10 border border-zinc-800 text-zinc-500 rounded-xl flex items-center justify-center hover:text-white transition-all"><Edit2 size={18}/></button><button onClick={() => onDelete(record.id)} className="w-10 h-10 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"><Trash2 size={18}/></button></>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
              {(editingId === record.id ? editForm.files : record.files)?.map((file, idx) => (
                <div key={file.id} className="relative group rounded-2xl overflow-hidden border border-zinc-900 bg-black aspect-square shadow-xl">
                  {file.mimeType?.includes('pdf') ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <FileText size={48} className="text-pink-500"/>
                    </div>
                  ) : (
                    <img src={file.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}
                  
                  <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity z-50 ${editingId === record.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isOwner && (
                      <button 
                        onClick={(e) => handleRemoveFileInternal(e, record.id, file.id)} 
                        className="w-9 h-9 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 border border-white/20 transition-all"
                        title="Padam Fail"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile({ recordId: record.id, index: idx, file }); }} 
                      className="w-9 h-9 bg-pink-500 text-black rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                      title="Lihat Pratinjau"
                    >
                      <Eye size={16}/>
                    </button>
                  </div>
                </div>
              ))}
              {editingId === record.id && (
                <button type="button" onClick={() => editFileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-700 hover:text-pink-500 transition-all hover:bg-zinc-900/50">
                  <Plus size={32}/>
                  <span className="text-[10px] font-black uppercase mt-2">TAMBAH FAIL</span>
                </button>
              )}
            </div>
            {editingId === record.id && <input type="file" ref={editFileInputRef} onChange={(e) => handleFileUpload(e, true)} className="hidden" accept="image/*,application/pdf" multiple />}
          </div>
        ))}
      </div>

      {selectedFile && (
        <FileViewModal file={selectedFile.file} type={selectedFile.file.mimeType?.includes('pdf') ? 'pdf' : 'image'} onClose={() => setSelectedFile(null)} onAddComment={()=>{}} onDeleteComment={()=>{}} onAddReaction={()=>{}} isOwner={isOwner} />
      )}
    </div>
  );
};

export default SuccessFormManager;
