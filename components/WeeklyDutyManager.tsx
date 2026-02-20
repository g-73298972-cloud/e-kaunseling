
import React, { useState, useRef } from 'react';
import { WeeklyDutyRecord, DayLog, FileAttachment } from '../types';
import { Plus, X, Trash2, Calendar, Clock, Camera, Eye, MessageSquare, Clipboard, Upload, Image as ImageIcon, MapPin } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface WeeklyDutyManagerProps {
  records: WeeklyDutyRecord[];
  onAdd: (record: Omit<WeeklyDutyRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdateRecord: (id: string, updated: WeeklyDutyRecord) => void;
  isOwner: boolean;
}

const DAYS = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU/AHAD'];

const WeeklyDutyManager: React.FC<WeeklyDutyManagerProps> = ({ records, onAdd, onDelete, onUpdateRecord, isOwner }) => {
  const [weekRange, setWeekRange] = useState('');
  const [scheduleImages, setScheduleImages] = useState<FileAttachment[]>([]);
  const [dayLogs, setDayLogs] = useState<DayLog[]>(DAYS.map(day => ({ day, images: [] })));
  const [selectedFile, setSelectedFile] = useState<{ recordId: string, dayIdx: number | 'schedule', imgIdx: number, file: FileAttachment } | null>(null);
  
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  const dayInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileUpload = (type: 'schedule' | number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const incoming = e.target.files;
    if (incoming) {
      Array.from(incoming).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name.toUpperCase(),
            mimeType: file.type,
            comments: [],
            reactions: [],
            dutyDetails: { date: '', time: '', location: '' }
          };
          if (type === 'schedule') {
            setScheduleImages(prev => [...prev, newFile]);
          } else {
            setDayLogs(prev => prev.map((log, idx) => idx === type ? { ...log, images: [...log.images, newFile] } : log));
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const updateDayImageDetail = (dayIdx: number, imgIdx: number, field: 'date' | 'time' | 'location', value: string) => {
    setDayLogs(prev => prev.map((log, dI) => dI === dayIdx ? {
      ...log,
      images: log.images.map((img, iI) => iI === imgIdx ? {
        ...img,
        dutyDetails: { ...(img.dutyDetails || { date: '', time: '', location: '' }), [field]: value.toUpperCase() }
      } : img)
    } : log));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekRange.trim()) {
      alert("Sila masukkan tarikh/tempoh minggu.");
      return;
    }
    onAdd({ weekNumber: 0, weekRange: weekRange.toUpperCase(), scheduleImages, dayLogs });
    setWeekRange('');
    setScheduleImages([]);
    setDayLogs(DAYS.map(day => ({ day, images: [] })));
  };

  const handleUpdateFile = (recordId: string, dayIdx: number | 'schedule', imgIdx: number, updatedFile: FileAttachment) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    let updatedRecord = { ...record };
    if (dayIdx === 'schedule') {
      updatedRecord.scheduleImages = updatedRecord.scheduleImages.map((f, i) => i === imgIdx ? updatedFile : f);
    } else {
      updatedRecord.dayLogs = updatedRecord.dayLogs.map((log, i) => i === dayIdx ? { ...log, images: log.images.map((f, fi) => fi === imgIdx ? updatedFile : f) } : log);
    }
    onUpdateRecord(recordId, updatedRecord);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(255,0,122,0.4)]">
          <Clipboard size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">INFO BERTUGAS MINGGUAN</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Log Jadual & Laporan Bergambar Harian</p>
        </div>
      </div>

      {isOwner && (
        <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-8">Pendaftaran Tugas Mingguan Baru</h4>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Tempoh / Tarikh Mingguan (Cth: 1 JAN - 5 JAN)</label>
                <input 
                  type="text" 
                  value={weekRange} 
                  onChange={(e) => setWeekRange(e.target.value)} 
                  placeholder="MASUKKAN TARIKH..." 
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:border-pink-500 outline-none uppercase" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> Jadual Bertugas (Lampiran Gambar)
              </label>
              <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-800 bg-black rounded-2xl">
                {scheduleImages.map((f, idx) => (
                  <div key={idx} className="relative w-24 h-24 border border-zinc-800 rounded-xl overflow-hidden group">
                    <img src={f.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setScheduleImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-pink-500 text-black p-1 rounded-md"><X size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => scheduleInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 text-zinc-700 hover:text-pink-500 transition-all">
                  <Upload size={24} />
                  <span className="text-[8px] font-black uppercase">Jadual</span>
                </button>
                <input type="file" ref={scheduleInputRef} onChange={handleFileUpload('schedule')} className="hidden" accept="image/*" multiple />
              </div>
            </div>

            <div className="space-y-10">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                <Camera size={16} className="text-pink-500" /> Log Gambar Harian & Caption
              </label>
              
              <div className="grid grid-cols-1 gap-8">
                {dayLogs.map((log, dayIdx) => (
                  <div key={log.day} className="space-y-6 p-8 border border-zinc-900 rounded-[2rem] bg-black/40">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                      <p className="text-xl font-heading text-white uppercase tracking-widest">{log.day}</p>
                      <button type="button" onClick={() => dayInputRefs.current[dayIdx]?.click()} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-pink-500 rounded-xl text-[9px] font-black uppercase border border-zinc-800 hover:bg-zinc-800 transition-all">
                         <Plus size={14} /> Tambah Gambar {log.day}
                      </button>
                      <input type="file" ref={el => dayInputRefs.current[dayIdx] = el} onChange={handleFileUpload(dayIdx)} className="hidden" accept="image/*" multiple />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {log.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group relative">
                          <div className="relative aspect-video">
                            <img src={img.url} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setDayLogs(prev => prev.map((l, i) => i === dayIdx ? { ...l, images: l.images.filter((_, fi) => fi !== imgIdx) } : l))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-xl hover:scale-110 transition-transform"><X size={14} /></button>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="relative">
                              <Calendar size={12} className="absolute left-3 top-3 text-zinc-700" />
                              <input 
                                type="text" 
                                value={img.dutyDetails?.date || ''} 
                                onChange={(e) => updateDayImageDetail(dayIdx, imgIdx, 'date', e.target.value)} 
                                placeholder="TARIKH TUGAS..." 
                                className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-[9px] font-bold text-white outline-none focus:border-pink-500"
                              />
                            </div>
                            <div className="relative">
                              <Clock size={12} className="absolute left-3 top-3 text-zinc-700" />
                              <input 
                                type="text" 
                                value={img.dutyDetails?.time || ''} 
                                onChange={(e) => updateDayImageDetail(dayIdx, imgIdx, 'time', e.target.value)} 
                                placeholder="MASA TUGAS..." 
                                className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-[9px] font-bold text-white outline-none focus:border-pink-500"
                              />
                            </div>
                            <div className="relative">
                              <MapPin size={12} className="absolute left-3 top-3 text-zinc-700" />
                              <input 
                                type="text" 
                                value={img.dutyDetails?.location || ''} 
                                onChange={(e) => updateDayImageDetail(dayIdx, imgIdx, 'location', e.target.value)} 
                                placeholder="LOKASI TUGAS..." 
                                className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-[9px] font-bold text-white outline-none focus:border-pink-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {log.images.length === 0 && (
                        <div className="col-span-full py-10 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-800 italic text-[10px] font-bold uppercase tracking-widest">
                           Sila muat naik gambar untuk {log.day}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-sm tracking-widest uppercase">
               Simpan Maklumat Bertugas
            </button>
          </form>
        </div>
      )}

      <div className="space-y-12">
        {records.length === 0 ? (
          <div className="text-center py-24 bp-card border-dashed bg-transparent text-zinc-800 italic text-sm uppercase">Tiada rekod bertugas diarkibkan.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bp-card overflow-hidden border-l-4 border-pink-500 group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-zinc-900 bg-zinc-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Calendar size={12} /> TEMPOH: {record.weekRange}
                    </span>
                  </div>
                  <h3 className="text-2xl font-heading text-white uppercase tracking-tighter">LOG BERTUGAS MINGGUAN</h3>
                </div>
                {isOwner && (
                  <button onClick={() => onDelete(record.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-800 hover:text-red-500 transition-all rounded-xl">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="p-8 space-y-10">
                {record.scheduleImages.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Clipboard size={14} /> JADUAL BERTUGAS RASMI
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {record.scheduleImages.map((f, idx) => (
                        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-black group/img cursor-pointer" onClick={() => setSelectedFile({ recordId: record.id, dayIdx: 'schedule', imgIdx: idx, file: f })}>
                          <img src={f.url} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="text-white" size={32} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-12">
                  {record.dayLogs.map((log, dayIdx) => (
                    <div key={dayIdx} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-white uppercase tracking-[0.4em]">{log.day}</span>
                        <div className="flex-1 h-px bg-zinc-900" />
                      </div>
                      
                      {log.images.length === 0 ? (
                        <div className="py-6 text-center text-[9px] font-bold text-zinc-800 uppercase italic tracking-widest">Tiada Log Visual</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {log.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="bg-black/40 border border-zinc-900 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 shadow-inner group/item">
                              <div className="relative aspect-video bg-black cursor-pointer overflow-hidden" onClick={() => setSelectedFile({ recordId: record.id, dayIdx, imgIdx, file: img })}>
                                <img src={img.url} className="w-full h-full object-cover transition-all duration-500 group-hover/item:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="text-white" size={24} />
                                </div>
                                {img.comments.length > 0 && (
                                  <div className="absolute top-3 left-3 bg-pink-500 text-black text-[8px] font-black px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                                     <MessageSquare size={10} /> {img.comments.length}
                                  </div>
                                )}
                              </div>
                              
                              <div className="p-5 space-y-2">
                                {img.dutyDetails && (img.dutyDetails.date || img.dutyDetails.time || img.dutyDetails.location) ? (
                                  <div className="grid grid-cols-1 gap-2">
                                    {img.dutyDetails.date && (
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-pink-500"><Calendar size={10} /></div>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase truncate">{img.dutyDetails.date}</span>
                                      </div>
                                    )}
                                    {img.dutyDetails.time && (
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-pink-500"><Clock size={10} /></div>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase truncate">{img.dutyDetails.time}</span>
                                      </div>
                                    )}
                                    {img.dutyDetails.location && (
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-pink-500"><MapPin size={10} /></div>
                                        <span className="text-[9px] font-bold text-white uppercase truncate font-black">{img.dutyDetails.location}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="py-2 text-center text-[8px] font-black text-zinc-800 uppercase italic tracking-widest">Tiada Butiran Tugasan</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            handleUpdateFile(selectedFile.recordId, selectedFile.dayIdx, selectedFile.imgIdx, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          onDeleteComment={(cid) => {
            const updated = { ...selectedFile.file };
            updated.comments = updated.comments.filter(c => c.id !== cid);
            handleUpdateFile(selectedFile.recordId, selectedFile.dayIdx, selectedFile.imgIdx, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }}
          onAddReaction={(e) => {
            const updated = { ...selectedFile.file };
            const ridx = updated.reactions.findIndex(r => r.emoji === e);
            if (ridx > -1) updated.reactions[ridx].count += 1; else updated.reactions.push({ emoji: e, count: 1 });
            handleUpdateFile(selectedFile.recordId, selectedFile.dayIdx, selectedFile.imgIdx, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default WeeklyDutyManager;
