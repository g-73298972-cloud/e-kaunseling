
import React, { useState, useRef } from 'react';
import { WeeklyAnalysis, FileAttachment } from '../types';
import { Upload, Plus, X, Trash2, ImageIcon, FileText, Calendar, Eye, MessageSquare, Download } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface WeeklyAnalysisManagerProps {
  records: WeeklyAnalysis[];
  onAdd: (record: Omit<WeeklyAnalysis, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onRemoveFile: (analysisId: string, type: 'pdf' | 'image', index: number) => void;
  onUpdateFile: (analysisId: string, type: 'pdf' | 'image', index: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const WeeklyAnalysisManager: React.FC<WeeklyAnalysisManagerProps> = ({ records, onAdd, onDelete, onRemoveFile, onUpdateFile, isOwner }) => {
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [pdfFiles, setPdfFiles] = useState<FileAttachment[]>([]);
  const [imageFiles, setImageFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ analysisId: string, type: 'pdf' | 'image', index: number, file: FileAttachment } | null>(null);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const files = e.target.files;
    if (files) {
      // FIX: Explicitly type 'file' as 'File' to resolve TypeScript 'unknown' type error
      Array.from(files).forEach((file: File) => {
        if (file.type !== 'application/pdf') { alert("Sila muat naik fail PDF sahaja."); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
          setPdfFiles(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name.toUpperCase(),
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const files = e.target.files;
    if (files) {
      // FIX: Explicitly type 'file' as 'File' to resolve TypeScript 'unknown' type error
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageFiles(prev => [...prev, {
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
    if (pdfFiles.length === 0 && imageFiles.length === 0) { alert("Sila muat naik sekurang-kurangnya satu fail PDF atau Gambar."); return; }
    onAdd({ weekNumber, pdfFiles, imageFiles });
    setPdfFiles([]); setImageFiles([]); setWeekNumber(prev => (prev < 45 ? prev + 1 : 1));
  };

  const handleAddComment = (text: string, userName: string) => {
    if (!selectedFile) return;
    const updatedFile = { ...selectedFile.file };
    updatedFile.comments = [...updatedFile.comments, {
      id: Math.random().toString(36).substr(2, 9),
      userName, text, timestamp: Date.now()
    }];
    onUpdateFile(selectedFile.analysisId, selectedFile.type, selectedFile.index, updatedFile);
    setSelectedFile({ ...selectedFile, file: updatedFile });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedFile) return;
    const updatedFile = { ...selectedFile.file };
    updatedFile.comments = updatedFile.comments.filter(c => c.id !== commentId);
    onUpdateFile(selectedFile.analysisId, selectedFile.type, selectedFile.index, updatedFile);
    setSelectedFile({ ...selectedFile, file: updatedFile });
  };

  const handleAddReaction = (emoji: string) => {
    if (!selectedFile) return;
    const updatedFile = { ...selectedFile.file };
    const reactionIndex = updatedFile.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex > -1) updatedFile.reactions[reactionIndex].count += 1;
    else updatedFile.reactions.push({ emoji, count: 1 });
    onUpdateFile(selectedFile.analysisId, selectedFile.type, selectedFile.index, updatedFile);
    setSelectedFile({ ...selectedFile, file: updatedFile });
  };

  const handleInternalRemove = () => {
    if (selectedFile) {
      onRemoveFile(selectedFile.analysisId, selectedFile.type, selectedFile.index);
    }
  };

  return (
    <div className="space-y-8">
      {isOwner && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">Tambah Laporan Analisis Baru</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> Pilih Minggu</label>
              <select value={weekNumber} onChange={(e) => setWeekNumber(parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                {Array.from({ length: 45 }, (_, i) => i + 1).map(w => <option key={w} value={w}>MINGGU {w}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Muat Naik Fail PDF</label>
                <div className="flex flex-wrap gap-2">
                   {pdfFiles.map((pdf, idx) => (
                     <div key={idx} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 group shadow-sm">
                        <FileText size={16} className="text-rose-500" />
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{pdf.name}</span>
                        <button type="button" onClick={() => setPdfFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                     </div>
                   ))}
                   <button type="button" onClick={() => pdfInputRef.current?.click()} className="h-10 px-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"><Upload size={16} /><span className="text-[10px] font-bold">PDF</span></button>
                </div>
                <input type="file" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" accept=".pdf" multiple />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Muat Naik Gambar Laporan</label>
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                      <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full shadow"><X size={10} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"><Plus size={18} /></button>
                </div>
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm uppercase">Simpan Rekod Analisis</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {records.length === 0 ? (
          <div className="text-center py-16 text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">Tiada rekod analisis mingguan disimpan.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 relative group hover:border-indigo-300 transition-all shadow-sm hover:shadow-xl duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><span className="font-black text-xl">{record.weekNumber}</span></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Minggu {record.weekNumber}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> Analisis Perkhidmatan Terkumpul
                    </p>
                  </div>
                </div>
                {isOwner && <button onClick={() => onDelete(record.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md"><Trash2 size={20} /></button>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PDF Section */}
                {record.pdfFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-rose-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fail Laporan PDF ({record.pdfFiles.length})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {record.pdfFiles.map((file, idx) => (
                        <div 
                          key={idx} 
                          className="relative group/pdf bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:from-indigo-50 hover:to-white hover:border-indigo-300 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] duration-200" 
                          onClick={() => setSelectedFile({ analysisId: record.id, type: 'pdf', index: idx, file })}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-inner group-hover/pdf:bg-rose-100 transition-colors">
                              <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-700 truncate uppercase leading-tight mb-1">{file.name}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Eye size={10} /> Papar PDF
                                </span>
                                {file.comments.length > 0 && (
                                  <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                                    <MessageSquare size={10} /> {file.comments.length} KOMEN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center opacity-0 group-hover/pdf:opacity-100 transition-opacity">
                              <Plus size={16} />
                            </div>
                            {isOwner && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveFile(record.id, 'pdf', idx); }} 
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-red-100"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images Section */}
                {record.imageFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gambar Bukti ({record.imageFiles.length})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {record.imageFiles.map((file, idx) => (
                        <div 
                          key={idx} 
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group/img bg-slate-100 cursor-zoom-in active:scale-95 transition-all duration-300" 
                          onClick={() => setSelectedFile({ analysisId: record.id, type: 'image', index: idx, file })}
                        >
                          <img src={file.url} alt="Bukti" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                               <Eye size={20} />
                            </div>
                            <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full">Zoom / Komen</span>
                          </div>
                          <div className="absolute top-2 left-2 flex gap-1">
                            {file.comments.length > 0 && (
                              <div className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg border border-white/20">
                                <MessageSquare size={8} /> {file.comments.length}
                              </div>
                            )}
                          </div>
                          {isOwner && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onRemoveFile(record.id, 'image', idx); }} 
                              className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-md text-white p-1.5 rounded-xl shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity border border-white/20 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedFile && (
        <FileViewModal 
          file={selectedFile.file} 
          type={selectedFile.type} 
          onClose={() => setSelectedFile(null)} 
          onAddComment={handleAddComment} 
          onDeleteComment={handleDeleteComment} 
          onAddReaction={handleAddReaction} 
          onDeleteFile={handleInternalRemove}
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default WeeklyAnalysisManager;
