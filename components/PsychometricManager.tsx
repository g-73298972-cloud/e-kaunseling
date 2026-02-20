
import React, { useState, useRef } from 'react';
import { PsychometricScore, PsychometricEvidence, FileAttachment } from '../types';
import { Plus, X, Trash2, Eye, FileText, Upload, PieChart, Clipboard, Camera, Search, TrendingUp, BookOpen, Sparkles, PenTool, FlaskConical, Palette, HeartHandshake, Megaphone, Calculator, UserCheck, Users, Check, Edit2, Image as ImageIcon, Percent, Users2 } from 'lucide-react';
import FileViewModal from './FileViewModal';

interface PsychometricManagerProps {
  scores: PsychometricScore[];
  evidences: PsychometricEvidence[];
  hollandImages?: Record<string, string>;
  onUpdateHollandImage: (code: string, url: string) => void;
  onAddScore: (score: Omit<PsychometricScore, 'id' | 'updatedAt'>) => void;
  onUpdateScore: (id: string, score: Omit<PsychometricScore, 'id' | 'updatedAt'>) => void;
  onDeleteScore: (id: string) => void;
  onAddEvidence: (evidence: Omit<PsychometricEvidence, 'id' | 'createdAt'>) => void;
  onDeleteEvidence: (id: string) => void;
  onUpdateFile: (evidenceId: string, index: number, updatedFile: FileAttachment) => void;
  onRemoveFile: (evidenceId: string, index: number) => void;
  isOwner: boolean;
}

const CLASS_OPTIONS = ['AMANAH', 'BERDIKARI', 'CEMERLANG', 'DEDIKASI', 'EFEKTIF', 'FATANAH', 'GEMILANG', 'HARAPAN', 'STEM', 'KAA', 'PVMA'];

const RIASEC_DATA = [
  { 
    code: 'REALISTIC', 
    nick: 'The Doers', 
    sub: 'Practical & Physical', 
    desc: 'People with a Realistic code love to work with their hands, tools, plants, or animals. They are practical, grounded, and prefer tangible results over abstract theories. They typically avoid social activities like healing or informing others.', 
    traits: 'Practical, mechanical, independent.', 
    env: 'Outdoors, engineering firms, construction sites.', 
    icon: <PenTool size={32} />, 
    color: 'border-pink-500', 
    text: 'text-pink-500',
    glow: 'shadow-pink-500/20' 
  },
  { 
    code: 'INVESTIGATIVE', 
    nick: 'The Thinkers', 
    sub: 'Analytical & Curious', 
    desc: 'Investigative types are the problem solvers. They love to observe, learn, analyze, and solve complex problems. They value science and logic over persuasion. They prefer to work independently to understand the physical or world.', 
    traits: 'Analytical, intellectual, curious.', 
    env: 'Laboratories, universities, research centers.', 
    icon: <FlaskConical size={32} />, 
    color: 'border-blue-500', 
    text: 'text-blue-500',
    glow: 'shadow-blue-500/20' 
  },
  { 
    code: 'ARTISTIC', 
    nick: 'The Creators', 
    sub: 'Expressive & Original', 
    desc: 'Artistic individuals thrive on self-expression. They dislike rigid rules and prefer unstructured environments where they can use their imagination and creativity. They value aesthetics and emotional expression.', 
    traits: 'Creative, intuitive, expressive.', 
    env: 'Theaters, design studios, museums, advertising agencies.', 
    icon: <Palette size={32} />, 
    color: 'border-purple-500', 
    text: 'text-purple-500',
    glow: 'shadow-purple-500/20' 
  },
  { 
    code: 'SOCIAL', 
    nick: 'The Helpers', 
    sub: 'Empathetic & Supportive', 
    desc: 'If you have a Social Holland Code, you likely enjoy working with people to enlighten, inform, help, train, or cure them. You are skilled with words and value relationships. You likely avoid using machines or tools to achieve a goal.', 
    traits: 'Helpful, friendly, trustworthy.', 
    env: 'Schools, hospitals, counseling centers, non-profits.', 
    icon: <HeartHandshake size={32} />, 
    color: 'border-green-500', 
    text: 'text-green-500',
    glow: 'shadow-green-500/20' 
  },
  { 
    code: 'ENTERPRISING', 
    nick: 'The Persuaders', 
    sub: 'Ambitious & Energetic', 
    desc: 'Enterprising types like to work with people too, but for a different reason: to influence, persuade, or lead. They are goal-oriented and often enjoy business or politics. They value success, status, and leadership.', 
    traits: 'Energetic, ambitious, sociable.', 
    env: 'Corporate offices, sales floors, courtrooms, real estate firms.', 
    icon: <Megaphone size={32} />, 
    color: 'border-orange-500', 
    text: 'text-orange-500',
    glow: 'shadow-orange-500/20' 
  },
  { 
    code: 'CONVENTIONAL', 
    nick: 'The Organizers', 
    sub: 'Structured & Detail-Oriented', 
    desc: 'Conventional Holland Code types prefer working with data and numbers. They like structure, clear rules, and carrying out tasks in detail. They are the backbone of any organized system and often avoid unstructured or ambiguous activities.', 
    traits: 'Efficient, careful, organized.', 
    env: 'Banks, accounting firms, administrative offices, quality control labs.', 
    icon: <Calculator size={32} />, 
    color: 'border-yellow-500', 
    text: 'text-yellow-500',
    glow: 'shadow-yellow-500/20' 
  }
];

const PsychometricManager: React.FC<PsychometricManagerProps> = ({ 
  scores, evidences, hollandImages = {}, onUpdateHollandImage, onAddScore, onUpdateScore, onDeleteScore, 
  onAddEvidence, onDeleteEvidence, onUpdateFile, onRemoveFile, isOwner 
}) => {
  const [activeTab, setActiveTab] = useState<'skor' | 'analisis' | 'evidens' | 'info'>('skor');
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0]);
  const [formData, setFormData] = useState({
    realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0,
    totalStudents: 0, answeredCount: 0
  });

  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<FileAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ evidenceId: string, index: number, file: FileAttachment } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hollandUploadRef = useRef<HTMLInputElement>(null);
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    const existing = scores.find(s => s.className === selectedClass);
    if (existing) {
      onUpdateScore(existing.id, formData);
    } else {
      onAddScore({ className: selectedClass, ...formData });
    }
    alert(`SKOR KELAS ${selectedClass} BERJAYA DISIMPAN.`);
  };

  const handleHollandImageUpload = (code: string) => {
    setUploadingCode(code);
    hollandUploadRef.current?.click();
  };

  const onHollandFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingCode) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateHollandImage(uploadingCode, reader.result as string);
        setUploadingCode(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDominant = (score: any) => {
    const items = [
      { code: 'R', label: 'REALISTIC', val: score.realistic || 0 },
      { code: 'I', label: 'INVESTIGATIVE', val: score.investigative || 0 },
      { code: 'A', label: 'ARTISTIC', val: score.artistic || 0 },
      { code: 'S', label: 'SOCIAL', val: score.social || 0 },
      { code: 'E', label: 'ENTERPRISING', val: score.enterprising || 0 },
      { code: 'C', label: 'CONVENTIONAL', val: score.conventional || 0 }
    ];
    return items.sort((a, b) => b.val - a.val).slice(0, 3);
  };

  const calculateOverallAnalysis = () => {
    if (scores.length === 0) return null;
    
    interface Totals {
      realistic: number; investigative: number; artistic: number; social: number; enterprising: number; conventional: number;
      totalStudents: number; answeredCount: number;
    }

    const totals = scores.reduce((acc: Totals, curr) => {
      return {
        realistic: acc.realistic + curr.realistic,
        investigative: acc.investigative + curr.investigative,
        artistic: acc.artistic + curr.artistic,
        social: acc.social + curr.social,
        enterprising: acc.enterprising + curr.enterprising,
        conventional: acc.conventional + curr.conventional,
        totalStudents: acc.totalStudents + (curr.totalStudents || 0),
        answeredCount: acc.answeredCount + (curr.answeredCount || 0)
      };
    }, { 
      realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0,
      totalStudents: 0, answeredCount: 0
    });

    const avg = {
      realistic: Math.round(totals.realistic / scores.length),
      investigative: Math.round(totals.investigative / scores.length),
      artistic: Math.round(totals.artistic / scores.length),
      social: Math.round(totals.social / scores.length),
      enterprising: Math.round(totals.enterprising / scores.length),
      conventional: Math.round(totals.conventional / scores.length)
    };

    return { 
      avg, 
      dominant: calculateDominant(avg),
      totalParticipation: totals.totalStudents > 0 ? Math.round((totals.answeredCount / totals.totalStudents) * 100) : 0,
      totalAnswered: totals.answeredCount,
      totalEnrollment: totals.totalStudents
    };
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvidenceFiles(prev => [...prev, {
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
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim() || evidenceFiles.length === 0) return;
    onAddEvidence({ title: evidenceTitle.toUpperCase(), files: evidenceFiles });
    setEvidenceTitle('');
    setEvidenceFiles([]);
  };

  const overall = calculateOverallAnalysis();

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-2xl shadow-lg"><PieChart size={40} /></div>
        <div>
          <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">Pentaksiran Psikometrik</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2">Inventori Minat Kerjaya (Holland Code)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          { id: 'skor', label: 'REKOD SKOR KELAS', icon: <Clipboard size={16} /> },
          { id: 'analisis', label: 'ANALISIS TINGKATAN 5', icon: <TrendingUp size={16} /> },
          { id: 'info', label: 'INFO KOD KERJAYA', icon: <BookOpen size={16} /> },
          { id: 'evidens', label: 'EVIDENS PELAKSANAAN', icon: <Camera size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 border transition-all flex items-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest ${
              activeTab === tab.id 
                ? 'bg-pink-500 text-black border-pink-500 shadow-lg scale-105' 
                : 'bg-black border-zinc-900 text-zinc-500 hover:border-pink-500/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'skor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {isOwner && (
            <div className="bp-card p-10 bg-zinc-950/30">
              <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-8">Pilih Kelas & Masukkan Skor Holland</h4>
              <form onSubmit={handleSaveScore} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Nama Kelas</label>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-sm font-bold text-white focus:border-pink-500 outline-none"
                  >
                    {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-black/40 p-6 rounded-2xl border border-zinc-900">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Users size={10}/> Jumlah Murid</label>
                    <input type="number" name="totalStudents" value={formData.totalStudents} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-bold text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><UserCheck size={10}/> Menjawab</label>
                    <input type="number" name="answeredCount" value={formData.answeredCount} onChange={handleInputChange} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-bold text-white outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{field.toUpperCase()}</label>
                      <input 
                        type="number" 
                        name={field}
                        value={(formData as any)[field]} 
                        onChange={handleInputChange}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-bold text-white outline-none"
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                  SIMPAN REKOD KELAS
                </button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Senarai Skor Kelas ({scores.length})</h4>
            {scores.length === 0 ? (
              <div className="py-20 text-center bp-card border-dashed bg-transparent text-zinc-800 italic uppercase">Tiada Rekod Skor</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {scores.map(score => {
                  const dominant = calculateDominant(score);
                  const total = score.totalStudents || 0;
                  const answered = score.answeredCount || 0;
                  const unanswered = Math.max(0, total - answered);
                  const answeredPercent = total > 0 ? Math.round((answered / total) * 100) : 0;
                  const unansweredPercent = total > 0 ? 100 - answeredPercent : 0;

                  return (
                    <div key={score.id} className="bp-card p-6 border-l-4 border-white flex flex-col gap-6 group hover:border-pink-500 transition-all">
                       <div className="flex justify-between items-start">
                          <div className="flex-1">
                             <p className="text-2xl font-heading text-white uppercase tracking-tighter">KELAS {score.className}</p>
                             <div className="flex gap-2 mt-2">
                                {dominant.map((d, i) => (
                                  <span key={i} className={`text-[9px] font-black px-2 py-0.5 rounded-md ${i === 0 ? 'bg-pink-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {d.code} ({d.val})
                                  </span>
                                ))}
                             </div>
                          </div>
                          {isOwner && (
                            <button onClick={() => onDeleteScore(score.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                               <Trash2 size={20} />
                            </button>
                          )}
                       </div>

                       {/* Participation Stats */}
                       <div className="space-y-4 pt-4 border-t border-zinc-900">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                   <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><UserCheck size={10} /> Sudah Menjawab</p>
                                   <span className="text-[10px] font-black text-white">{answeredPercent}%</span>
                                </div>
                                <p className="text-lg font-black text-white leading-none">{answered} <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">MURID</span></p>
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                   <p className="text-[8px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5"><Users2 size={10} /> Belum Menjawab</p>
                                   <span className="text-[10px] font-black text-white">{unansweredPercent}%</span>
                                </div>
                                <p className="text-lg font-black text-white leading-none">{unanswered} <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">MURID</span></p>
                             </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner">
                             <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{ width: `${answeredPercent}%` }} 
                             />
                             <div 
                                className="h-full bg-pink-500 transition-all duration-1000" 
                                style={{ width: `${unansweredPercent}%` }} 
                             />
                          </div>
                          
                          <div className="flex justify-between items-center text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                             <span>Enrolmen: {total} Murid</span>
                             <span>Data Terkini: {new Date(score.updatedAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analisis' && (
        <div className="space-y-12">
          {!overall ? (
            <div className="py-32 text-center bp-card border-dashed bg-transparent text-zinc-800 italic uppercase font-black tracking-widest">Sila masukkan data skor kelas.</div>
          ) : (
            <div className="space-y-8">
              <div className="bp-card p-10 border-l-8 border-pink-500">
                <p className="text-xs font-black text-pink-500 uppercase tracking-[0.4em] mb-3">Dominan Tingkatan 5</p>
                <h3 className="text-5xl font-heading text-white uppercase tracking-tighter mb-6">PROFIL MAKRO KERJAYA</h3>
                <div className="flex flex-wrap gap-4">
                  {overall.dominant.map((d, i) => (
                    <div key={i} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 min-w-[120px] ${i === 0 ? 'bg-pink-500 text-black border-pink-500 shadow-xl scale-110 z-10' : 'bg-black border-zinc-900 text-white'}`}>
                       <span className="text-4xl font-black">{d.code}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bp-card p-8 border-l-4 border-emerald-500 bg-zinc-950/20">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Percent size={12}/> Pencapaian Menjawab</p>
                    <h4 className="text-4xl font-heading text-white">{overall.totalParticipation}%</h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2">Daripada Jumlah Keseluruhan Murid</p>
                 </div>
                 <div className="bp-card p-8 border-l-4 border-blue-500 bg-zinc-950/20">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><UserCheck size={12}/> Rekod Terkumpul</p>
                    <h4 className="text-4xl font-heading text-white">{overall.totalAnswered}</h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2">Murid Berjaya Menghantar Skor</p>
                 </div>
                 <div className="bp-card p-8 border-l-4 border-zinc-700 bg-zinc-950/20">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={12}/> Jumlah Enrolmen</p>
                    <h4 className="text-4xl font-heading text-white">{overall.totalEnrollment}</h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2">Jumlah Murid Dalam Pangkalan Data</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
          <input type="file" ref={hollandUploadRef} onChange={onHollandFileChange} className="hidden" accept="image/*" />
          {RIASEC_DATA.map((item) => (
            <div key={item.code} className={`bp-card p-0 overflow-hidden group flex flex-col border-2 transition-all ${item.color} ${item.glow}`}>
              {/* Image Section */}
              <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
                {hollandImages[item.code] ? (
                  <img src={hollandImages[item.code]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.code} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 gap-4">
                     <div className={`${item.text} opacity-20`}>{item.icon}</div>
                     <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.4em]">No Custom Visual</span>
                  </div>
                )}
                
                {/* Admin Overlay Upload */}
                {isOwner && (
                  <button 
                    onClick={() => handleHollandImageUpload(item.code)}
                    className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-2xl flex items-center gap-2 hover:bg-pink-500 hover:text-black transition-all shadow-2xl"
                  >
                    <ImageIcon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Kemas kini Visual</span>
                  </button>
                )}
                
                <div className="absolute top-4 left-4">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className={item.text}>{item.icon}</div>
                      <span className="text-lg font-heading text-white tracking-widest">{item.code}</span>
                   </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 space-y-6">
                <div>
                   <h3 className="text-3xl font-heading text-white tracking-tighter uppercase">{item.nick}</h3>
                   <p className={`${item.text} text-[10px] font-black uppercase tracking-[0.3em] mt-1`}>{item.sub}</p>
                </div>
                
                <p className="text-zinc-400 text-sm font-medium leading-relaxed uppercase">
                   {item.desc}
                </p>
                
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-zinc-900">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Key Traits:</p>
                      <p className="text-xs font-bold text-white uppercase">{item.traits}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ideal Environment:</p>
                      <p className="text-xs font-bold text-white uppercase italic">{item.env}</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'evidens' && (
        <div className="space-y-8">
          {isOwner && (
            <div className="bp-card p-10 bg-zinc-950/30">
              <form onSubmit={handleAddEvidence} className="space-y-8">
                <input 
                  type="text" value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} 
                  placeholder="TAJUK EVIDENS..." 
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white uppercase focus:border-pink-500" 
                />
                <div className="flex flex-wrap gap-4 p-6 border-2 border-dashed border-zinc-800 rounded-2xl">
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-700 hover:text-pink-500">
                      <Plus size={32} />
                      <span className="text-[8px] font-black uppercase">TAMBAH</span>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleEvidenceUpload} className="hidden" accept="image/*,application/pdf" multiple />
                </div>
                <button type="submit" className="w-full btn-pink py-5 rounded-2xl font-black text-xs uppercase shadow-xl">SIMPAN EVIDENS</button>
              </form>
            </div>
          )}
          
          <div className="space-y-6">
            {evidences.map(ev => (
              <div key={ev.id} className="bp-card p-8 group border-l-4 border-white transition-all">
                <div className="flex justify-between items-start mb-6">
                   <h4 className="font-heading text-2xl text-white uppercase">{ev.title}</h4>
                   {isOwner && <button onClick={() => onDeleteEvidence(ev.id)} className="text-zinc-800 hover:text-red-500"><Trash2 size={24} /></button>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ev.files.map((file, idx) => (
                    <div key={idx} className="relative aspect-square border border-zinc-900 bg-black rounded-xl overflow-hidden cursor-pointer" onClick={() => setSelectedFile({ evidenceId: ev.id, index: idx, file })}>
                       <img src={file.url} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-pink-500/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFile && (
        <FileViewModal 
          file={selectedFile.file} 
          type={selectedFile.file.mimeType?.includes('pdf') ? 'pdf' : 'image'} 
          onClose={() => setSelectedFile(null)} 
          onAddComment={() => {}} 
          onDeleteComment={() => {}} 
          onAddReaction={() => {}} 
          isOwner={isOwner} 
        />
      )}
    </div>
  );
};

export default PsychometricManager;
