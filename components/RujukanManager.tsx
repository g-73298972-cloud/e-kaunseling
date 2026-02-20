
import React, { useState, useRef } from 'react';
import { RujukanRecord, FileAttachment, RujukanLink } from '../types';
import { Plus, X, Trash2, Eye, Library, FileText, Upload, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface RujukanManagerProps {
  records: RujukanRecord[];
  onAdd: (record: Omit<RujukanRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onRemoveFile: (recordId: string, fileId: string) => void;
  onUpdateFile: (recordId: string, index: number, updatedFile: FileAttachment) => void;
  onUpdate: (id: string, updated: Partial<RujukanRecord>) => void;
  isOwner: boolean;
}

const RujukanManager: React.FC<RujukanManagerProps> = ({ records, onAdd, onDelete, onRemoveFile, onUpdateFile, onUpdate, isOwner }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RujukanRecord>>({});
  
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
    if (window.confirm('Padam fail rujukan ini secara kekal?')) {
      if (editingId === recordId) {
        setEditForm(prev => ({ ...prev, files: (prev.files || []).filter(f => f.id !== fileId) }));
      } else {
        onRemoveFile(recordId, fileId);
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
        <div className="bg-pink-500 p-4 rounded-2xl text-black shadow-lg shadow-pink-500/20"><Library size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase">Rujukan Profesional</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2 pt-1">Pangkalan Data Dokumen & Arkib Digital</p>
        </div>
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/30">
          <form onSubmit={(e) => { e.preventDefault(); if(title.trim()){ onAdd({title: title.toUpperCase(), description: description.toUpperCase(), files, links: []}); setTitle(''); setDescription(''); setFiles([]); } }} className="space-y-6">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="TAJUK RUJUKAN..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold uppercase text-white outline-none focus:border-pink-500" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="KETERANGAN DOKUMEN..." className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold uppercase text-white outline-none min-h-[80px]" />
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
            <button type="submit" className="w-full btn-pink py-4 rounded-xl font-black uppercase text-xs">SIMPAN RUJUKAN</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {records.map(record => (
          <div key={record.id} className={`bp-card p-10 relative border-l-4 ${editingId === record.id ? 'border-pink-500' : 'border-zinc-800'} shadow-xl transition-all`}>
            <div className="flex justify-between items-start mb-8 border-b border-zinc-900 pb-4">
              <div className="flex-1 pr-6">
                {editingId === record.id ? (
                  <div className="space-y-4">
                    <input value={editForm.title || ''} onChange={(e) => setEditForm({...editForm, title: e.target.value.toUpperCase()})} className="text-2xl font-heading bg-black border border-pink-500 rounded-lg p-2 w-full text-white" />
                    <textarea value={editForm.description || ''} onChange={(e) => setEditForm({...editForm, description: e.target.value.toUpperCase()})} className="text-sm bg-black border border-pink-500 rounded-lg p-2 w-full text-zinc-400" />
                  </div>
                ) : (
                  <>
                    <h4 className="font-heading text-2xl text-white uppercase">{record.title}</h4>
                    <p className="text-zinc-500 text-sm font-bold uppercase mt-2">{record.description}</p>
                  </>
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
                  
                  {/* Toolbar Kawalan yang diperkukuh */}
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
                      title="Lihat Fail"
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

export default RujukanManager;
