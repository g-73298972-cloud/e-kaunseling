
import React, { useState, useRef } from 'react';
import { SumbanganRecord, SumbanganType, SumbanganLevel, FileAttachment } from '../types';
import { Plus, X, Trash2, Eye, MessageSquare, BookOpen, Trophy, School, UserCircle, Hammer, Globe, Calendar, FileText, Upload, Edit2, Check } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface SumbanganManagerProps {
  records: SumbanganRecord[];
  onAdd: (record: Omit<SumbanganRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updated: Partial<SumbanganRecord>) => void;
  onRemoveImage: (recordId: string, imageIndex: number) => void;
  onUpdateFile: (recordId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const SumbanganManager: React.FC<SumbanganManagerProps> = ({ records, onAdd, onDelete, onUpdate, onRemoveImage, onUpdateFile, isOwner }) => {
  const [activeTab, setActiveTab] = useState<SumbanganType>('DALAM SEKOLAH');
  const [formData, setFormData] = useState({ namaProgram: '', tarikh: '', sumbanganRole: '', peringkat: 'DAERAH' as SumbanganLevel, tugas: '' });
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, index: number, file: FileAttachment } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SumbanganRecord>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const incomingFiles = e.target.files;
    if (incomingFiles) {
      Array.from(incomingFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFiles(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: reader.result as string, name: file.name.toUpperCase(), mimeType: file.type, comments: [], reactions: [] }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !formData.namaProgram.trim()) return;
    onAdd({ type: activeTab, namaProgram: formData.namaProgram, files, ...(activeTab === 'DALAM SEKOLAH' ? { tarikh: formData.tarikh, sumbanganRole: formData.sumbanganRole } : { peringkat: formData.peringkat, tugas: formData.tugas }) });
    setFormData({ namaProgram: '', tarikh: '', sumbanganRole: '', peringkat: 'DAERAH', tugas: '' }); setFiles([]);
  };

  const startEditing = (record: SumbanganRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const filteredRecords = records.filter(r => r.type === activeTab);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black rounded-3xl flex items-center justify-center shadow-lg"><Hammer size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">SUMBANGAN</h2>
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-[0.3em] mt-2">Arkib Jawatankuasa Sekolah / Luar</p>
        </div>
      </div>

      <div className="flex gap-4">
        {(['DALAM SEKOLAH', 'LUAR SEKOLAH'] as SumbanganType[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 border-2 transition-all rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase ${activeTab === tab ? 'bg-pink-500 text-black border-pink-500 shadow-lg' : 'bg-black border-zinc-900 text-zinc-600 hover:border-pink-500/50'}`}>
            {tab}
          </button>
        ))}
      </div>

      {isOwner && !editingId && (
        <div className="bp-card p-10 bg-zinc-950/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><FileText size={12}/> Program / Aktiviti</label>
                <input type="text" name="namaProgram" value={formData.namaProgram} onChange={handleInputChange} placeholder="NAMA PROGRAM..." className="w-full bg-black border border-zinc-900 rounded-xl px-6 py-4 text-sm font-bold text-white uppercase focus:border-pink-500 transition-all" required />
              </div>
              {activeTab === 'DALAM SEKOLAH' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Tarikh</label>
                  <input type="date" name="tarikh" value={formData.tarikh} onChange={handleInputChange} className="w-full bg-black border border-zinc-900 rounded-xl px-6 py-4 text-sm font-bold text-white focus:border-pink-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Peringkat</label>
                  <select name="peringkat" value={formData.peringkat} onChange={handleInputChange} className="w-full bg-black border border-zinc-900 rounded-xl px-6 py-4 text-sm font-bold text-white uppercase focus:border-pink-500">
                    <option value="DAERAH">DAERAH</option>
                    <option value="NEGERI">NEGERI</option>
                    <option value="KEBANGSAAN">KEBANGSAAN</option>
                    <option value="ANTARABANGSA">ANTARABANGSA</option>
                  </select>
                </div>
              )}
            </div>
            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black uppercase shadow-lg">Simpan Rekod {activeTab}</button>
          </form>
        </div>
      )}

      <div className="space-y-10">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-24 text-zinc-800 italic uppercase font-black tracking-widest border-2 border-dashed border-zinc-900 rounded-3xl">Archive Empty</div>
        ) : filteredRecords.map((record) => (
          <div key={record.id} className="bp-card p-10 group relative transition-all duration-500 border-l-4 border-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 pb-6 border-b border-zinc-900">
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase text-pink-500 tracking-widest">{record.type}</span>
                  {record.peringkat && <span className="text-[9px] font-black uppercase bg-white text-black px-2 py-0.5 rounded-md">{record.peringkat}</span>}
                </div>
                {editingId === record.id ? (
                  <input className="text-3xl font-heading bg-black border border-pink-500/30 rounded-xl px-4 py-2 w-full text-white uppercase outline-none" value={editForm.namaProgram || ''} onChange={(e) => setEditForm({...editForm, namaProgram: e.target.value.toUpperCase()})} />
                ) : (
                  <h3 className="text-3xl font-heading text-white leading-none uppercase tracking-tighter">{record.namaProgram}</h3>
                )}
                {record.type === 'DALAM SEKOLAH' ? (
                   <div className="flex flex-wrap gap-6 mt-4">
                      {editingId === record.id ? (
                        <div className="flex gap-4 w-full">
                           <input type="date" className="bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" value={editForm.tarikh || ''} onChange={(e) => setEditForm({...editForm, tarikh: e.target.value})} />
                           <input placeholder="PERANAN..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white uppercase" value={editForm.sumbanganRole || ''} onChange={(e) => setEditForm({...editForm, sumbanganRole: e.target.value.toUpperCase()})} />
                        </div>
                      ) : (
                        <>
                          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={14} className="text-pink-500"/> {record.tarikh || 'TIADA TARIKH'}</p>
                          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Trophy size={14} className="text-pink-500"/> {record.sumbanganRole || '-'}</p>
                        </>
                      )}
                   </div>
                ) : (
                  <div className="mt-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-inner">
                    {editingId === record.id ? (
                      <textarea className="w-full bg-black border border-pink-500/30 rounded-xl p-4 text-xs text-white uppercase outline-none" value={editForm.tugas || ''} onChange={(e) => setEditForm({...editForm, tugas: e.target.value.toUpperCase()})} />
                    ) : (
                      <p className="text-white text-sm font-bold uppercase leading-relaxed italic">{record.tugas || 'TIADA HURAIAN TUGAS'}</p>
                    )}
                  </div>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  {editingId === record.id ? (
                    <>
                      <button onClick={saveEdit} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-110 transition-all shadow-lg"><Check size={20} /></button>
                      <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-xl"><X size={20} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(record)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-white rounded-xl transition-all hover:bg-zinc-900"><Edit2 size={18} /></button>
                      <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 rounded-xl transition-all hover:bg-red-950/30"><Trash2 size={18} /></button>
                    </>
                  )}
                </div>
              )}
            </div>

            {record.files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {record.files.map((file, idx) => (
                  <div key={idx} className="relative aspect-[3/4] border border-zinc-900 group/img cursor-pointer rounded-2xl overflow-hidden bg-black shadow-lg" onClick={() => setSelectedFile({ recordId: record.id, index: idx, file })}>
                    {file.mimeType?.includes('pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-950 text-center"><FileText size={40} className="text-pink-500 mb-2" /><span className="text-[7px] font-black text-zinc-500 uppercase truncate w-full px-2">{file.name}</span></div>
                    ) : (
                      <img src={file.url} className="w-full h-full object-cover p-1 opacity-60 group-hover/img:opacity-100 transition-all duration-700 group-hover/img:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Eye size={24} className="text-white" /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedFile && (
        <FileViewModal file={selectedFile.file} type={selectedFile.file.mimeType?.includes('pdf') ? 'pdf' : 'image'} onClose={() => setSelectedFile(null)} onAddComment={()=>{}} onDeleteComment={()=>{}} onAddReaction={()=>{}} isOwner={isOwner} />
      )}
    </div>
  );
};

export default SumbanganManager;
