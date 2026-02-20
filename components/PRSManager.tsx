import React, { useState, useRef, useMemo } from 'react';
import { PRSMember, PRSContent, FileAttachment } from '../types';
import { Plus, X, Trash2, Users, Calendar, Camera, Heart, Eye, MessageSquare, BadgeCheck, Network, Upload, School, Edit2, Check, FileText, Clipboard, LayoutPanelTop, Search, ListChecks, ShieldCheck, Crown, User, Star } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface PRSManagerProps {
  members: PRSMember[];
  dutySchedule: PRSContent[];
  activities: PRSContent[];
  gallery: PRSContent[];
  orgCharts: PRSContent[]; 
  prsLogoUrl?: string | null;
  prsDutyScheduleUrl?: string | null;
  prsGroupImageUrl?: string | null;
  onUpdatePrsLogo: (url: string) => void;
  onUpdatePrsDutySchedule: (url: string) => void;
  onUpdatePrsGroupImage: (url: string) => void;
  onAddMember: (name: string, studentClass: string, position: string) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMember: (id: string, updated: Partial<PRSMember>) => void;
  onAddContent: (type: 'duty' | 'activity' | 'gallery' | 'org', content: Omit<PRSContent, 'id' | 'createdAt'>) => void;
  onDeleteContent: (type: 'duty' | 'activity' | 'gallery' | 'org', id: string) => void;
  onUpdateContent: (type: 'duty' | 'activity' | 'gallery' | 'org', id: string, updated: Partial<PRSContent>) => void;
  onRemoveImage: (type: 'duty' | 'activity' | 'gallery' | 'org', contentId: string, imageIndex: number) => void;
  onUpdateFile: (type: 'duty' | 'activity' | 'gallery' | 'org', contentId: string, imageIndex: number, updatedFile: FileAttachment) => void;
  isOwner: boolean;
}

const CLASS_NAMES = ['AMANAH', 'BERDIKARI', 'CEMERLANG', 'DEDIKASI', 'EFEKTIF', 'FATANAH', 'GEMILANG', 'HARAPAN', 'IKHLAS', 'JUJUR', 'KREATIF', 'STEM', 'KAA', 'PVMA'];
const FORMS = ['1', '2', '3', '4', '5'];
const POSITIONS = ['PENGERUSI', 'NAIB PENGERUSI', 'SETIAUSAHA', 'NAIB SETIAUSAHA', 'BENDAHARI', 'NAIB BENDAHARI', 'AJK TERTINGGI', 'AHLI AKTIF'];

// Hirarki weightage untuk susunan automatik
const POSITION_WEIGHTS: Record<string, number> = {
  'PENGERUSI': 1,
  'NAIB PENGERUSI': 2,
  'SETIAUSAHA': 3,
  'BENDAHARI': 3,
  'NAIB SETIAUSAHA': 4,
  'NAIB BENDAHARI': 4,
  'AJK TERTINGGI': 5,
  'AHLI AKTIF': 6
};

const PRSManager: React.FC<PRSManagerProps> = ({ 
  members, dutySchedule, activities, gallery, orgCharts, prsLogoUrl, prsDutyScheduleUrl, prsGroupImageUrl,
  onUpdatePrsLogo, onUpdatePrsDutySchedule, onUpdatePrsGroupImage,
  onAddMember, onDeleteMember, onUpdateMember, onAddContent, onDeleteContent, onUpdateContent, onRemoveImage, onUpdateFile, isOwner 
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'duty' | 'org' | 'activity' | 'gallery'>('members');
  
  const [newName, setNewName] = useState('');
  const [selectedForm, setSelectedForm] = useState('1');
  const [selectedClassName, setSelectedClassName] = useState(CLASS_NAMES[0]);
  const [selectedPosition, setSelectedPosition] = useState(POSITIONS[POSITIONS.length - 1]);
  
  const [newCaption, setNewCaption] = useState('');
  const [newImages, setNewImages] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ prsId: string, type: 'duty' | 'activity' | 'gallery' | 'org' | 'master', index: number, file: FileAttachment } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prsLogoInputRef = useRef<HTMLInputElement>(null);
  const prsDutyInputRef = useRef<HTMLInputElement>(null);
  const prsGroupInputRef = useRef<HTMLInputElement>(null);

  // Proses data untuk carta organisasi dinamik
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const weightA = POSITION_WEIGHTS[a.position] || 99;
      const weightB = POSITION_WEIGHTS[b.position] || 99;
      return weightA - weightB;
    });
  }, [members]);

  const pengerusi = sortedMembers.filter(m => m.position === 'PENGERUSI');
  const naibPengerusi = sortedMembers.filter(m => m.position === 'NAIB PENGERUSI');
  const g1_sec_ben = sortedMembers.filter(m => m.position === 'SETIAUSAHA' || m.position === 'BENDAHARI');
  const g2_naib = sortedMembers.filter(m => m.position === 'NAIB SETIAUSAHA' || m.position === 'NAIB BENDAHARI');
  const ajkTertinggi = sortedMembers.filter(m => m.position === 'AJK TERTINGGI');
  const ahliAktif = sortedMembers.filter(m => m.position === 'AHLI AKTIF');

  const handleAddMember = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (newName.trim()) { 
      const studentClass = `${selectedForm} ${selectedClassName}`;
      onAddMember(newName.toUpperCase(), studentClass, selectedPosition); 
      setNewName(''); 
      setSelectedPosition(POSITIONS[POSITIONS.length - 1]);
    } 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImages(prev => [...prev, {
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

  const handleAddContent = (type: 'org' | 'activity' | 'gallery' | 'duty', e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim() && newImages.length === 0) return;
    onAddContent(type, { caption: newCaption.toUpperCase(), images: newImages });
    setNewCaption(''); setNewImages([]);
  };

  const handleDeleteMasterImage = (type: 'duty' | 'group') => {
    const label = type === 'duty' ? 'Jadual Bertugas' : 'Pembahagian Kumpulan';
    if (window.confirm(`Adakah anda pasti untuk memadam imej master ${label}?`)) {
      if (type === 'duty') onUpdatePrsDutySchedule("");
      else onUpdatePrsGroupImage("");
    }
  };

  const renderContentList = (items: PRSContent[], type: 'duty' | 'activity' | 'gallery' | 'org') => (
    <div className="grid grid-cols-1 gap-8 mt-8">
      {items.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2rem] bg-black/20">
          <p className="text-zinc-800 italic font-black uppercase tracking-widest text-xs">Tiada Rekod Arkib</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="relative p-8 bp-card group border-l-4 border-white overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start mb-8 border-b border-zinc-900 pb-6">
               <div className="flex-1">
                 <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-2 italic">Entry Log Visual</p>
                 <h4 className="text-xl font-heading text-white uppercase leading-tight tracking-tight">{item.caption}</h4>
               </div>
               {isOwner && (
                 <button onClick={() => onDeleteContent(type, item.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-900 text-zinc-700 hover:text-red-500 rounded-xl transition-all hover:bg-red-950/30">
                    <Trash2 size={18} />
                 </button>
               )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {item.images.map((file, idx) => (
                <div key={idx} className="relative aspect-[3/4] border border-zinc-900 group/img cursor-pointer rounded-2xl overflow-hidden bg-black shadow-lg" onClick={() => setSelectedFile({ prsId: item.id, type, index: idx, file })}>
                  <img src={file.url} className="w-full h-full object-cover opacity-70 group-hover/img:opacity-100 transition-all duration-700 group-hover/img:scale-110" alt="PRS Evidence" />
                  <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={24} /></div>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {file.comments.length > 0 && <div className="bg-pink-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg"><MessageSquare size={8} /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Profil Header Lembaga PRS */}
      <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-zinc-900 pb-10">
        <div className="relative group/logo">
          <div onClick={() => isOwner && prsLogoInputRef.current?.click()} className={`w-24 h-24 bg-black border-2 border-zinc-800 flex items-center justify-center rounded-[2rem] shadow-xl relative overflow-hidden transition-all ${isOwner ? 'cursor-pointer hover:border-pink-500' : ''}`}>
            {prsLogoUrl ? <img src={prsLogoUrl} alt="PRS Logo" className="w-full h-full object-contain p-2" /> : <BadgeCheck size={48} className="text-pink-500" />}
            {isOwner && <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center"><Camera size={20} className="text-white" /></div>}
          </div>
          <input type="file" ref={prsLogoInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => onUpdatePrsLogo(r.result as string); r.readAsDataURL(f); } }} className="hidden" accept="image/*" />
        </div>
        <div>
          <h2 className="text-5xl font-heading text-white leading-none uppercase tracking-tighter">Pembimbing Rakan Sebaya</h2>
          <p className="text-sm font-bold text-pink-500 uppercase tracking-[0.4em] mt-3 italic">"Bantu Diri Untuk Bantu Orang Lain"</p>
        </div>
      </div>

      {/* Bar Navigasi Tab Terus */}
      <div className="flex flex-wrap gap-4 p-2 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] w-fit shadow-2xl">
        {[
          { id: 'members', label: 'SENARAI AHLI', icon: <Users size={16} /> },
          { id: 'org', label: 'CARTA ORGANISASI', icon: <Network size={16} /> },
          { id: 'duty', label: 'JADUAL BERTUGAS', icon: <Calendar size={16} /> },
          { id: 'activity', label: 'AKTIVITI', icon: <Camera size={16} /> },
          { id: 'gallery', label: 'GALERI', icon: <Heart size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-3 active:scale-95 ${activeTab === tab.id ? 'bg-zinc-900 text-pink-500 shadow-[inset_0_0_15px_rgba(255,0,122,0.1)] border border-pink-500/30' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {activeTab === 'members' && (
          <div className="space-y-12">
            {isOwner && (
              <form onSubmit={handleAddMember} className="bp-card p-10 bg-zinc-950/30 flex flex-col gap-8 border-dashed shadow-inner">
                <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest italic flex items-center gap-2">
                  <Plus size={14} /> TAMBAH AHLI BARU
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-2">NAMA PENUH</label>
                    <input 
                      type="text" value={newName} onChange={(e) => setNewName(e.target.value.toUpperCase())} 
                      placeholder="NAMA AHLI..." 
                      className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-pink-500 outline-none shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-2">TINGKATAN / KELAS</label>
                    <div className="flex gap-2">
                      <select value={selectedForm} onChange={(e) => setSelectedForm(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-pink-500 outline-none">
                        {FORMS.map(f => <option key={f} value={f}>TING {f}</option>)}
                      </select>
                      <select value={selectedClassName} onChange={(e) => setSelectedClassName(e.target.value)} className="flex-[2] bg-black border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-pink-500 outline-none">
                        {CLASS_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-2">JAWATAN ORGANISASI</label>
                    <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-pink-500 focus:border-pink-500 outline-none">
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full md:w-auto md:px-16 h-[66px] btn-pink rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform">
                    DAFTAR AHLI
                  </button>
                </div>
              </form>
            )}
            
            <div className="bp-card p-10 bg-black/20">
              <h3 className="text-2xl font-heading text-white uppercase tracking-tighter mb-10 border-b border-zinc-900 pb-6">DIREKTORI AHLI PRS ({members.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.length === 0 ? (
                  <p className="col-span-full text-center py-20 text-zinc-800 italic uppercase font-black tracking-[0.5em] text-xs">PANGKALAN DATA KOSONG</p>
                ) : (
                  members.map((member, idx) => (
                    <div key={member.id} className="p-6 border border-zinc-900 rounded-3xl flex flex-col bg-black/40 hover:border-pink-500/50 transition-all group/item relative overflow-hidden shadow-lg hover:-translate-y-1">
                      <div className={`absolute top-0 right-0 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-xl ${['PENGERUSI', 'NAIB PENGERUSI', 'SETIAUSAHA', 'BENDAHARI'].includes(member.position) ? 'bg-pink-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{member.position}</div>
                      <div className="flex items-start gap-5 flex-1 mt-3">
                        <span className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-pink-500 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner">{idx + 1}</span>
                        <div className="flex flex-col flex-1 min-w-0 pr-6">
                          <span className="font-bold text-white uppercase tracking-tight truncate text-base leading-tight mb-2">{member.name}</span>
                          <div className="flex items-center gap-2"><School size={12} className="text-pink-500" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{member.studentClass}</span></div>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 shrink-0 mt-6 justify-end border-t border-zinc-900/50 pt-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button onClick={() => onDeleteMember(member.id)} className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-600 hover:text-red-500 rounded-xl bg-zinc-900/50"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'org' && (
          <div className="space-y-20">
            {/* CARTA ORGANISASI DINAMIK - AUTOMATIK */}
            <div className="space-y-12">
               <div className="flex items-center gap-6 px-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.4em]">CARTA ORGANISASI DINAMIK</h4>
                  <div className="flex-1 h-px bg-zinc-900" />
               </div>

               {members.length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-black/20">
                    <p className="text-zinc-800 italic font-black uppercase tracking-widest text-xs">Sila Tambah Ahli di Tab "Senarai Ahli" Untuk Jana Carta</p>
                 </div>
               ) : (
                 <div className="space-y-16">
                    {/* Level 1: Pengerusi */}
                    <div className="flex justify-center">
                       {pengerusi.map(m => <OrgCard key={m.id} member={m} level="top" />)}
                    </div>

                    {/* Level 2: Naib Pengerusi */}
                    <div className="flex justify-center flex-wrap gap-12">
                       {naibPengerusi.map(m => <OrgCard key={m.id} member={m} level="high" />)}
                    </div>

                    {/* Level 3: Setiausaha & Bendahari */}
                    <div className="flex justify-center flex-wrap gap-8">
                       {g1_sec_ben.map(m => <OrgCard key={m.id} member={m} level="mid" />)}
                    </div>

                    {/* Level 4: Naib-naib */}
                    <div className="flex justify-center flex-wrap gap-6">
                       {g2_naib.map(m => <OrgCard key={m.id} member={m} level="mid-low" />)}
                    </div>

                    {/* Level 5: AJK Tertinggi */}
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-center text-zinc-800 uppercase tracking-[0.5em]">AJK TERTINGGI</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {ajkTertinggi.map(m => <OrgCard key={m.id} member={m} level="low" />)}
                       </div>
                    </div>

                    {/* Level 6: Ahli Aktif */}
                    <div className="space-y-6 border-t border-zinc-900 pt-16">
                       <p className="text-[10px] font-black text-center text-zinc-800 uppercase tracking-[0.5em]">AHLI-AHLI AKTIF</p>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                          {ahliAktif.map(m => <OrgCard key={m.id} member={m} level="member" />)}
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* ARKIB MANUAL (EKSISTING) */}
            <div className="space-y-12 border-t border-zinc-900 pt-20">
              <div className="flex items-center gap-6 px-4">
                 <h4 className="text-sm font-black text-zinc-700 uppercase tracking-[0.4em]">ARKIB FAIL & CARTA MANUAL</h4>
                 <div className="flex-1 h-px bg-zinc-900/50" />
              </div>
              {isOwner && (
                <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
                    <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-8 italic">Simpanan Rekod Carta Sejarah</h4>
                    <form onSubmit={(e) => handleAddContent('org', e)} className="space-y-10">
                        <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value.toUpperCase())} placeholder="KAPSYEN ATAU PENERANGAN CARTA..." className="w-full bg-black border border-zinc-800 rounded-2xl p-8 text-sm font-bold outline-none uppercase text-white focus:border-pink-500 min-h-[120px] shadow-inner" />
                        <div className="flex flex-wrap gap-6 p-8 border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-black">
                            {newImages.map((f, i) => (<div key={i} className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 relative shadow-2xl"><img src={f.url} className="w-full h-full object-cover" alt="Preview" /><button onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg shadow-xl"><X size={14}/></button></div>))}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-800 hover:text-pink-500 transition-all hover:bg-zinc-900 shadow-sm"><Upload size={32} /></button>
                        </div>
                        <button type="submit" className="w-full btn-pink py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl">SIMPAN REKOD</button>
                    </form>
                </div>
              )}
              {renderContentList(orgCharts, 'org')}
            </div>
          </div>
        )}

        {activeTab === 'duty' && (
          <div className="space-y-12">
            {/* Slot Muat Naik Master - Berkembar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Slot 1: PEMBAHAGIAN KUMPULAN */}
               <div className="bp-card overflow-hidden border-l-8 border-pink-500 bg-zinc-950/20">
                  <div className="p-8 border-b border-zinc-900 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-heading text-white uppercase tracking-tighter flex items-center gap-3">
                        <ListChecks size={20} className="text-pink-500" /> PEMBAHAGIAN KUMPULAN
                      </h3>
                      <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">Struktur Pembahagian Kumpulan Ahli</p>
                    </div>
                    {isOwner && (
                       <div className="flex gap-2">
                         {prsGroupImageUrl && (
                           <button onClick={() => handleDeleteMasterImage('group')} className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-xl">
                             <Trash2 size={16} />
                           </button>
                         )}
                         <button onClick={() => prsGroupInputRef.current?.click()} className="btn-pink w-10 h-10 rounded-xl flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                           <Upload size={16} />
                         </button>
                       </div>
                    )}
                    <input type="file" ref={prsGroupInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r=new FileReader(); r.onloadend=()=>onUpdatePrsGroupImage(r.result as string); r.readAsDataURL(f); } }} className="hidden" accept="image/*" />
                  </div>
                  <div className="aspect-video bg-black/40 flex items-center justify-center relative cursor-zoom-in group/master" onClick={() => prsGroupImageUrl && setSelectedFile({ prsId: 'group_master', type: 'master', index: 0, file: { id: 'group_master', url: prsGroupImageUrl, comments: [], reactions: [] } })}>
                    {prsGroupImageUrl ? (
                       <>
                         <img src={prsGroupImageUrl} alt="Group Master" className="w-full h-full object-contain" />
                         <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/master:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={32} /></div>
                       </>
                    ) : (
                       <div className="flex flex-col items-center gap-3 opacity-20"><Search size={48} /><p className="font-black uppercase tracking-[0.3em] text-[9px]">Tiada Carta Kumpulan</p></div>
                    )}
                  </div>
               </div>

               {/* Slot 2: JADUAL BERTUGAS */}
               <div className="bp-card overflow-hidden border-l-8 border-white bg-zinc-950/20">
                  <div className="p-8 border-b border-zinc-900 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-heading text-white uppercase tracking-tighter flex items-center gap-3">
                        <Clipboard size={20} className="text-pink-500" /> JADUAL BERTUGAS
                      </h3>
                      <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">Rujukan Roster Induk Sesi Semasa</p>
                    </div>
                    {isOwner && (
                       <div className="flex gap-2">
                         {prsDutyScheduleUrl && (
                           <button onClick={() => handleDeleteMasterImage('duty')} className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-xl">
                             <Trash2 size={16} />
                           </button>
                         )}
                         <button onClick={() => prsDutyInputRef.current?.click()} className="btn-pink w-10 h-10 rounded-xl flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                           <Upload size={16} />
                         </button>
                       </div>
                    )}
                    <input type="file" ref={prsDutyInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r=new FileReader(); r.onloadend=()=>onUpdatePrsDutySchedule(r.result as string); r.readAsDataURL(f); } }} className="hidden" accept="image/*" />
                  </div>
                  <div className="aspect-video bg-black/40 flex items-center justify-center relative cursor-zoom-in group/master" onClick={() => prsDutyScheduleUrl && setSelectedFile({ prsId: 'duty_master', type: 'master', index: 0, file: { id: 'duty_master', url: prsDutyScheduleUrl, comments: [], reactions: [] } })}>
                    {prsDutyScheduleUrl ? (
                       <>
                         <img src={prsDutyScheduleUrl} alt="Duty Master" className="w-full h-full object-contain" />
                         <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/master:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={32} /></div>
                       </>
                    ) : (
                       <div className="flex flex-col items-center gap-3 opacity-20"><Search size={48} /><p className="font-black uppercase tracking-[0.3em] text-[9px]">Tiada Jadual</p></div>
                    )}
                  </div>
               </div>
            </div>

            {/* Log Bertugas Mingguan */}
            <div className="space-y-10 border-t border-zinc-900 pt-16">
              <div className="flex items-center gap-6 px-4">
                 <h4 className="text-sm font-black text-white uppercase tracking-[0.4em]">LOG & REKOD BERTUGAS MINGGUAN</h4>
                 <div className="flex-1 h-px bg-zinc-900" />
              </div>
              {isOwner && (
                <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
                  <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-8 italic">Pendaftaran Log Bertugas Baru</h4>
                  <form onSubmit={(e) => handleAddContent('duty', e)} className="space-y-10">
                    <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value.toUpperCase())} placeholder="NAMA MINGGU / PENERANGAN TUGASAN..." className="w-full bg-black border border-zinc-800 rounded-2xl p-8 text-sm font-bold outline-none uppercase text-white focus:border-pink-500 min-h-[120px] shadow-inner" />
                    <div className="flex flex-wrap gap-6 p-8 border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-black">
                      {newImages.map((f, i) => (<div key={i} className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 relative shadow-2xl"><img src={f.url} className="w-full h-full object-cover" alt="Preview" /><button onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg shadow-xl"><X size={14}/></button></div>))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-800 hover:text-pink-500 transition-all hover:bg-zinc-900 shadow-sm"><Camera size={32} /></button>
                    </div>
                    <button type="submit" className="w-full btn-pink py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl">SIMPAN LOG MINGGUAN</button>
                  </form>
                </div>
              )}
              {renderContentList(dutySchedule, 'duty')}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-12">
            {isOwner && (
                <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
                    <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-8 italic">Log Aktiviti & Projek PRS</h4>
                    <form onSubmit={(e) => handleAddContent('activity', e)} className="space-y-10">
                        <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value.toUpperCase())} placeholder="PENERANGAN AKTIVITI..." className="w-full bg-black border border-zinc-800 rounded-2xl p-8 text-sm font-bold outline-none uppercase text-white focus:border-pink-500 min-h-[120px] shadow-inner" />
                        <div className="flex flex-wrap gap-6 p-8 border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-black">
                            {newImages.map((f, i) => (<div key={i} className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 relative shadow-2xl"><img src={f.url} className="w-full h-full object-cover" alt="Preview" /><button onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg shadow-xl"><X size={14}/></button></div>))}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-800 hover:text-pink-500 transition-all hover:bg-zinc-900 shadow-sm"><Upload size={32} /></button>
                        </div>
                        <button type="submit" className="w-full btn-pink py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl">SIMPAN AKTIVITI</button>
                    </form>
                </div>
            )}
            {renderContentList(activities, 'activity')}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-12">
            {isOwner && (
                <div className="bp-card p-10 bg-zinc-950/30 border-dashed">
                    <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-8 italic">Momen Life of PRS</h4>
                    <form onSubmit={(e) => handleAddContent('gallery', e)} className="space-y-10">
                        <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value.toUpperCase())} placeholder="KAPSYEN MOMEN..." className="w-full bg-black border border-zinc-800 rounded-2xl p-8 text-sm font-bold outline-none uppercase text-white focus:border-pink-500 min-h-[120px] shadow-inner" />
                        <div className="flex flex-wrap gap-6 p-8 border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-black">
                            {newImages.map((f, i) => (<div key={i} className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 relative shadow-2xl"><img src={f.url} className="w-full h-full object-cover" alt="Preview" /><button onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg shadow-xl"><X size={14}/></button></div>))}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-800 hover:text-pink-500 transition-all hover:bg-zinc-900 shadow-sm"><Upload size={32} /></button>
                        </div>
                        <button type="submit" className="w-full btn-pink py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl">SIMPAN MOMEN</button>
                    </form>
                </div>
            )}
            {renderContentList(gallery, 'gallery')}
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
      
      {selectedFile && (
        <FileViewModal 
          file={selectedFile.file} 
          type="image" 
          onClose={() => setSelectedFile(null)} 
          onAddComment={(t, u) => {
            if (selectedFile.type === 'master') return;
            const updated = { ...selectedFile.file };
            updated.comments = [...updated.comments, { id: Math.random().toString(36).substr(2, 9), userName: u, text: t, timestamp: Date.now() }];
            onUpdateFile(selectedFile.type as any, selectedFile.prsId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          onDeleteComment={(cid) => {
            if (selectedFile.type === 'master') return;
            const updated = { ...selectedFile.file };
            updated.comments = updated.comments.filter(c => c.id !== cid);
            onUpdateFile(selectedFile.type as any, selectedFile.prsId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }}
          onAddReaction={(e) => {
            if (selectedFile.type === 'master') return;
            const updated = { ...selectedFile.file };
            const ridx = updated.reactions.findIndex(r => r.emoji === e);
            if (ridx > -1) updated.reactions[ridx].count += 1; else updated.reactions.push({ emoji: e, count: 1 });
            onUpdateFile(selectedFile.type as any, selectedFile.prsId, selectedFile.index, updated);
            setSelectedFile({ ...selectedFile, file: updated });
          }} 
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

// Sub-component untuk Kad Ahli dalam Carta
const OrgCard: React.FC<{ member: PRSMember, level: 'top' | 'high' | 'mid' | 'mid-low' | 'low' | 'member' }> = ({ member, level }) => {
  const getStyles = () => {
    switch (level) {
      case 'top': return 'w-72 p-6 border-pink-500 bg-pink-500/10 shadow-[0_0_30px_rgba(255,0,122,0.3)] ring-4 ring-pink-500/20';
      case 'high': return 'w-64 p-5 border-white bg-white/5 shadow-xl';
      case 'mid': return 'w-56 p-4 border-zinc-800 bg-zinc-950/50';
      case 'mid-low': return 'w-48 p-4 border-zinc-900 bg-zinc-950/30';
      case 'low': return 'w-full p-4 border-zinc-900 bg-black/40';
      case 'member': return 'w-full p-3 border-zinc-900/50 bg-black/20 text-center';
      default: return '';
    }
  };

  const getIcon = () => {
    if (level === 'top') return <Crown className="text-pink-500 animate-bounce" size={24} />;
    if (level === 'high') return <ShieldCheck className="text-white" size={20} />;
    if (level === 'mid' || level === 'mid-low') return <Star className="text-pink-500/50" size={16} />;
    return <User className="text-zinc-800" size={14} />;
  };

  return (
    <div className={`bp-card rounded-[2rem] flex flex-col items-center gap-3 transition-all hover:scale-105 border-2 ${getStyles()}`}>
      <div className="w-12 h-12 bg-black border border-zinc-800 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
        {getIcon()}
      </div>
      <div className="text-center w-full min-w-0">
        <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${level === 'top' ? 'text-pink-500' : 'text-zinc-600'}`}>{member.position}</p>
        <h5 className={`font-bold uppercase truncate px-2 leading-tight ${level === 'top' ? 'text-xl text-white' : 'text-sm text-zinc-300'}`}>{member.name}</h5>
        <p className="text-[9px] font-black text-zinc-700 uppercase mt-1 tracking-widest">{member.studentClass}</p>
      </div>
    </div>
  );
};

export default PRSManager;