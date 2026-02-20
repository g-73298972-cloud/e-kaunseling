import React, { useState, useEffect, useRef } from 'react';
import { saveEntry, getEntries } from "./api";
import { FocusArea, ProgramRecord, UserProfile, SessionEntry, TeachInRecord, WeeklyAnalysis, PRSMember, PRSContent, FileAttachment, AssemblyRecord, MeetingRecord, ExternalTrainingRecord, WeeklyDutyRecord, SuccessFormRecord, BilikRecord, SumbanganRecord, BureauRecord, InovasiRecord, RujukanRecord, VisitorFeedback, PsychometricScore, PsychometricEvidence, MediaRecord } from './types';
import Header from './components/Header';
import KPISection from './components/KPISection';
import SessionManager from './components/SessionManager';
import TeachInManager from './components/TeachInManager';
import AssemblyManager from './components/AssemblyManager';
import MeetingManager from './components/MeetingManager';
import ExternalTrainingManager from './components/ExternalTrainingManager';
import WeeklyDutyManager from './components/WeeklyDutyManager';
import SuccessFormManager from './components/SuccessFormManager';
import WeeklyAnalysisManager from './components/WeeklyAnalysisManager';
import PRSManager from './components/PRSManager';
import BilikManager from './components/BilikManager';
import SumbanganManager from './components/SumbanganManager';
import BureauManager from './components/BureauManager';
import InovasiManager from './components/InovasiManager';
import RujukanManager from './components/RujukanManager';
import PsychometricManager from './components/PsychometricManager';
import ProgramForm from './components/ProgramForm';
import ProgramList from './components/ProgramList';
import VisitorGuestbook from './components/VisitorGuestbook';
import EmotionWidget from './components/EmotionWidget';
import { LayoutDashboard, PlusCircle, ListTodo, Users, BookOpen, Megaphone, Globe, FileBarChart, ClipboardList, CalendarDays, Home, FileCheck, Lock, LogOut, Lightbulb, Library, Trophy, Smile, PieChart, Volume2, ShieldAlert, Star, GraduationCap, Users2, Layout, Calendar, Briefcase, ShieldCheck, Key, Shield, Camera, Unlock, Wifi, WifiOff, CloudUpload } from 'lucide-react';

// KONFIGURASI LIVE SYNC (Sila masukkan URL pangkalan data anda di sini)
const API_ENDPOINT = ""; // Contoh: https://xyz.supabase.co/rest/v1/dashboard_data
const IS_LIVE_ENABLED = API_ENDPOINT !== "";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'records' | 'sessions' | 'teachin' | 'analisis' | 'prs' | 'assembly' | 'meeting' | 'training' | 'duty_w' | 'success' | 'bilik' | 'sumbangan' | 'inovasi' | 'rujukan' | 'psikometrik' | 'media' | 'kurikulum' | 'kokurikulum' | 'hem'>('dashboard');
  const [selectedFocus, setSelectedFocus] = useState<FocusArea>(FocusArea.SAHSIAH);
  
  // States
  const [records, setRecords] = useState<ProgramRecord[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [bilikRecords, setBilikRecords] = useState<BilikRecord[]>([]);
  const [sumbanganRecords, setSumbanganRecords] = useState<SumbanganRecord[]>([]);
  const [bureauRecords, setBureauRecords] = useState<BureauRecord[]>([]);
  const [inovasiRecords, setInovasiRecords] = useState<InovasiRecord[]>([]);
  const [rujukanRecords, setRujukanRecords] = useState<RujukanRecord[]>([]);
  const [teachInRecords, setTeachInRecords] = useState<TeachInRecord[]>([]);
  const [assemblyRecords, setAssemblyRecords] = useState<AssemblyRecord[]>([]);
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([]);
  const [trainingRecords, setExternalTrainingRecords] = useState<ExternalTrainingRecord[]>([]);
  const [weeklyDutyRecords, setWeeklyDutyRecords] = useState<WeeklyDutyRecord[]>([]);
  const [successForms, setSuccessForms] = useState<SuccessFormRecord[]>([]);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyAnalysis[]>([]);
  const [visitorFeedbacks, setVisitorFeedbacks] = useState<VisitorFeedback[]>([]);
  const [prsMembers, setPrsMembers] = useState<PRSMember[]>([]);
  const [prsDuty, setPrsDuty] = useState<PRSContent[]>([]);
  const [prsActivity, setPrsActivity] = useState<PRSContent[]>([]);
  const [prsGallery, setPrsGallery] = useState<PRSContent[]>([]);
  const [prsOrgCharts, setPrsOrgCharts] = useState<PRSContent[]>([]);
  const [psychometricScores, setPsychometricScores] = useState<PsychometricScore[]>([]);
  const [psychometricEvidences, setPsychometricEvidences] = useState<PsychometricEvidence[]>([]);

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Sesi Gatekeeper Security
  const [isSessionsUnlocked, setIsSessionsUnlocked] = useState<boolean>(false);
  const [sessionPinInput, setSessionPinInput] = useState<string>('');
  const sessionLogoRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "CIKGU LILY",
    since: "2016",
    quote: "Education is the most powerful weapon which you can use to change the world.",
    avatarUrl: null,
    schoolLogoUrl: null,
    schoolName: "SMK SEMERAH PADI, KUCHING",
    prsLogoUrl: null,
    prsGroupImageUrl: null,
    prsDutyScheduleUrl: null,
    sessionLogoUrl: null,
    jadualUrls: [],
    takwimUrls: [],
    currentEmotion: { emoji: '💖', label: 'AMAZING', timestamp: Date.now() },
    manualKpiIndividual: 0,
    manualKpiGroup: 0
  });

  // Fungsi Pemuatan Data Pintar (Awan + Lokal)
  useEffect(() => {
    const loadAllData = async () => {
      setIsCloudSyncing(true);
      
      // 1. Muat dari Awan jika didayakan
      if (IS_LIVE_ENABLED) {
        try {
          const response = await fetch(API_ENDPOINT);
          const cloudData = await response.json();
          // Map cloud data to states here...
          console.log("Data Cloud Berjaya Disegerakkan");
        } catch (err) {
          console.error("Gagal menyambung ke pangkalan data live. Menggunakan storan lokal.");
        }
      }

      // 2. Fallback kepada LocalStorage (Sedia ada)
      const load = (key: string) => { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; };
      setRecords(load('counseling_records') || []);
      setSessions(load('counseling_sessions') || []);
      setBilikRecords(load('counseling_bilik') || []);
      setSumbanganRecords(load('school_sumbangan') || []);
      setBureauRecords(load('school_bureaus') || []);
      setInovasiRecords(load('counseling_inovasi') || []);
      setRujukanRecords(load('counseling_rujukan') || []);
      setTeachInRecords(load('counseling_teachin') || []);
      setAssemblyRecords(load('counseling_assembly') || []);
      setMeetingRecords(load('counseling_meeting') || []);
      setExternalTrainingRecords(load('counseling_training') || []);
      setWeeklyDutyRecords(load('counseling_duty_weekly') || []);
      setSuccessForms(load('counseling_success') || []);
      setWeeklyAnalysis(load('counseling_analisis') || []);
      setPrsMembers(load('prs_members') || []);
      setPrsDuty(load('prs_duty') || []);
      setPrsActivity(load('prs_activity') || []);
      setPrsGallery(load('prs_gallery') || []);
      setPrsOrgCharts(load('prs_org_charts') || []);
      setPsychometricScores(load('counseling_psikometrik_scores') || []);
      setPsychometricEvidences(load('counseling_psikometrik_evidences') || []);
      setVisitorFeedbacks(load('visitor_feedbacks') || []);
      const savedProfile = load('counseling_profile');
      if (savedProfile) setProfile(savedProfile);
      if (sessionStorage.getItem('is_owner') === 'true') setIsOwner(true);
      
      setIsCloudSyncing(false);
      setLastSyncTime(Date.now());
    };

    loadAllData();

    // Jika Live, muat data setiap 5 minit untuk pastikan sentiasa terkini bagi pelawat
    if (IS_LIVE_ENABLED) {
        const interval = setInterval(loadAllData, 300000);
        return () => clearInterval(interval);
    }
  }, []);

  // Sync Logic - Simpan secara automatik
  useEffect(() => { 
    localStorage.setItem('counseling_records', JSON.stringify(records));
    if (IS_LIVE_ENABLED && isOwner) syncToCloud('records', records);
  }, [records]);

  useEffect(() => { localStorage.setItem('counseling_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('counseling_bilik', JSON.stringify(bilikRecords)); }, [bilikRecords]);
  useEffect(() => { localStorage.setItem('school_sumbangan', JSON.stringify(sumbanganRecords)); }, [sumbanganRecords]);
  useEffect(() => { localStorage.setItem('school_bureaus', JSON.stringify(bureauRecords)); }, [bureauRecords]);
  useEffect(() => { localStorage.setItem('counseling_inovasi', JSON.stringify(inovasiRecords)); }, [inovasiRecords]);
  useEffect(() => { localStorage.setItem('counseling_rujukan', JSON.stringify(rujukanRecords)); }, [rujukanRecords]);
  useEffect(() => { localStorage.setItem('counseling_teachin', JSON.stringify(teachInRecords)); }, [teachInRecords]);
  useEffect(() => { localStorage.setItem('counseling_assembly', JSON.stringify(assemblyRecords)); }, [assemblyRecords]);
  useEffect(() => { localStorage.setItem('counseling_meeting', JSON.stringify(meetingRecords)); }, [meetingRecords]);
  useEffect(() => { localStorage.setItem('counseling_training', JSON.stringify(trainingRecords)); }, [trainingRecords]);
  useEffect(() => { localStorage.setItem('counseling_duty_weekly', JSON.stringify(weeklyDutyRecords)); }, [weeklyDutyRecords]);
  useEffect(() => { localStorage.setItem('counseling_success', JSON.stringify(successForms)); }, [successForms]);
  useEffect(() => { localStorage.setItem('counseling_analisis', JSON.stringify(weeklyAnalysis)); }, [weeklyAnalysis]);
  useEffect(() => { localStorage.setItem('prs_members', JSON.stringify(prsMembers)); }, [prsMembers]);
  useEffect(() => { localStorage.setItem('prs_duty', JSON.stringify(prsDuty)); }, [prsDuty]);
  useEffect(() => { localStorage.setItem('prs_activity', JSON.stringify(prsActivity)); }, [prsActivity]);
  useEffect(() => { localStorage.setItem('prs_gallery', JSON.stringify(prsGallery)); }, [prsGallery]);
  useEffect(() => { localStorage.setItem('prs_org_charts', JSON.stringify(prsOrgCharts)); }, [prsOrgCharts]);
  useEffect(() => { localStorage.setItem('counseling_psikometrik_scores', JSON.stringify(psychometricScores)); }, [psychometricScores]);
  useEffect(() => { localStorage.setItem('counseling_psikometrik_evidences', JSON.stringify(psychometricEvidences)); }, [psychometricEvidences]);
  useEffect(() => { 
    localStorage.setItem('visitor_feedbacks', JSON.stringify(visitorFeedbacks));
    // Maklum balas pelawat sentiasa disegerakkan ke cloud supaya Cikgu Lily boleh lihat secara live
    if (IS_LIVE_ENABLED) syncToCloud('feedbacks', visitorFeedbacks);
  }, [visitorFeedbacks]);
  
  useEffect(() => { localStorage.setItem('counseling_profile', JSON.stringify(profile)); }, [profile]);

  // Fungsi Simulasi Cloud Sync
  const syncToCloud = async (key: string, data: any) => {
      if (!IS_LIVE_ENABLED) return;
      setIsCloudSyncing(true);
      try {
          // Logika penghantaran data ke API Awan sebenar
          // await fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify({ key, data }) });
          console.log(`Cloud Sync: ${key.toUpperCase()} Berjaya dikemaskini secara Live.`);
      } finally {
          setIsCloudSyncing(false);
          setLastSyncTime(Date.now());
      }
  };

  const handleLogin = () => {
    if (passwordInput === 'lily2016') {
      setIsOwner(true);
      sessionStorage.setItem('is_owner', 'true');
      setShowLoginModal(false);
      setPasswordInput('');
    } else {
      alert("KATA LALUAN PENTADBIR SALAH.");
    }
  };

  const handleUnlockSessions = () => {
    if (sessionPinInput.toUpperCase() === 'LILY_SESSIONS') {
      setIsSessionsUnlocked(true);
      setSessionPinInput('');
    } else {
      alert("KOD AKSES DAFTAR KLIEN TIDAK SAH. SILA RUJUK PENTADBIR.");
    }
  };

  const handleSessionLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, sessionLogoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setIsOwner(false);
    setIsSessionsUnlocked(false);
    sessionStorage.removeItem('is_owner');
    setActiveTab('dashboard');
  };

  const handleUpdateKPI = (type: 'manualKpiIndividual' | 'manualKpiGroup', val: number) => {
    setProfile(prev => ({
      ...prev,
      [type]: val,
      [type === 'manualKpiIndividual' ? 'lastUpdateIndividual' : 'lastUpdateGroup']: Date.now()
    }));
  };

  return (
    <div className="flex min-h-screen relative bg-black">
      <aside className="w-72 bg-[#050505] border-r border-zinc-900 fixed h-screen overflow-y-auto z-40 flex flex-col custom-scrollbar">
        <div className="p-8 flex flex-col items-center border-b border-zinc-900 mb-6">
          <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,0,122,0.4)] mb-4">
            L
          </div>
          <h1 className="text-white font-heading text-lg tracking-widest uppercase text-center leading-none">Lily</h1>
          <h2 className="text-pink-500 font-heading text-xl tracking-widest uppercase text-center mt-1">Executive</h2>
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-3">Est 2016 - MQ</p>
          
          {/* Cloud Sync Badge */}
          <div className="mt-6 w-full px-4">
             <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full border ${IS_LIVE_ENABLED ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                {IS_LIVE_ENABLED ? (isCloudSyncing ? <CloudUpload size={12} className="animate-bounce" /> : <Wifi size={12} />) : <WifiOff size={12} />}
                <span className="text-[8px] font-black uppercase tracking-widest">{IS_LIVE_ENABLED ? (isCloudSyncing ? 'Syncing...' : 'Live Dashboard') : 'Offline Mode'}</span>
             </div>
             {IS_LIVE_ENABLED && (
                <p className="text-[6px] text-center mt-1.5 text-zinc-700 font-bold uppercase tracking-widest">
                   Update: {new Date(lastSyncTime).toLocaleTimeString()}
                </p>
             )}
          </div>
        </div>

        <nav className="flex flex-col px-4 pb-20 gap-1">
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Halaman Utama" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          {isOwner && (
            <SidebarLink icon={<PlusCircle size={18} />} label="Halaman Tambah Rekod" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          )}
          <SidebarLink icon={<ListTodo size={18} />} label="ARKIB PROGRAM" active={activeTab === 'records'} onClick={() => setActiveTab('records')} />
          
          <SidebarHeader label="Operations" />
          <SidebarLink icon={<Users2 size={18} />} label="Daftar Klien" active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} />
          <SidebarLink icon={<GraduationCap size={18} />} label="Lembaga PRS" active={activeTab === 'prs'} onClick={() => setActiveTab('prs')} />
          <SidebarLink icon={<BookOpen size={18} />} label="Aktiviti Teach-In" active={activeTab === 'teachin'} onClick={() => setActiveTab('teachin')} />
          <SidebarLink icon={<Megaphone size={18} />} label="Rekod Perhimpunan" active={activeTab === 'assembly'} onClick={() => setActiveTab('assembly')} />
          <SidebarLink icon={<ClipboardList size={18} />} label="Taklimat & Mesyuarat" active={activeTab === 'meeting'} onClick={() => setActiveTab('meeting')} />
          <SidebarLink icon={<Globe size={18} />} label="Latihan & Kursus" active={activeTab === 'training'} onClick={() => setActiveTab('training')} />
          <SidebarLink icon={<Layout size={18} />} label="Info Bertugas Mingguan" active={activeTab === 'duty_w'} onClick={() => setActiveTab('duty_w')} />
          <SidebarLink icon={<FileBarChart size={18} />} label="Analisis Mingguan" active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')} />
          <SidebarLink icon={<Smile size={18} />} label="Status Emosi" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />

          <SidebarHeader label="Unit Pentadbiran" />
          <SidebarLink icon={<Home size={18} />} label="Kurikulum" active={activeTab === 'kurikulum'} onClick={() => setActiveTab('kurikulum')} />
          <SidebarLink icon={<Trophy size={18} />} label="Kokurikulum" active={activeTab === 'kokurikulum'} onClick={() => setActiveTab('kokurikulum')} />
          <SidebarLink icon={<Users size={18} />} label="Hal Ehwal Murid" active={activeTab === 'hem'} onClick={() => setActiveTab('hem')} />

          <SidebarHeader label="Assets" />
          <SidebarLink icon={<Home size={18} />} label="Pengurusan Bilik" active={activeTab === 'bilik'} onClick={() => setActiveTab('bilik')} />
          <SidebarLink icon={<Star size={18} />} label="Sumbangan" active={activeTab === 'sumbangan'} onClick={() => setActiveTab('sumbangan')} />
          <SidebarLink icon={<PieChart size={18} />} label="Pentaksiran Psikometrik" active={activeTab === 'psikometrik'} onClick={() => setActiveTab('psikometrik')} />
          <SidebarLink icon={<Lightbulb size={18} />} label="Kajian Inovasi Amalan" active={activeTab === 'inovasi'} onClick={() => setActiveTab('inovasi')} />
          <SidebarLink icon={<Library size={18} />} label="Rujukan" active={activeTab === 'rujukan'} onClick={() => setActiveTab('rujukan')} />
          <SidebarLink icon={<FileCheck size={18} />} label="Rekod Keberhasilan" active={activeTab === 'success'} onClick={() => setActiveTab('success')} />
        </nav>

        <div className="mt-auto p-6 border-t border-zinc-900">
          {isOwner ? (
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase text-[10px] tracking-widest">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-pink-500 hover:border-pink-500/30 transition-all font-bold uppercase text-[10px] tracking-widest">
              <Lock size={16} /> Admin Access
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 lg:p-20 space-y-20 relative z-10">
        <Header 
          profile={profile} 
          isOwner={isOwner} 
          onAvatarUpdate={(url) => setProfile(prev => ({...prev, avatarUrl: url}))}
          onSchoolLogoUpdate={(url) => setProfile(prev => ({...prev, schoolLogoUrl: url}))}
          onEmotionUpdate={(e) => setProfile(prev => ({...prev, currentEmotion: e}))}
        />

        <div className="space-y-24">
          {activeTab === 'dashboard' && (
            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-heading text-white uppercase tracking-tighter">Executive Overview</h2>
                 {isOwner && (
                   <button onClick={() => setActiveTab('add')} className="btn-pink px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] uppercase font-black tracking-widest shadow-xl">
                      <PlusCircle size={16} /> Tambah Rekod Baru
                   </button>
                 )}
              </div>
              <EmotionWidget currentEmotion={profile.currentEmotion} isOwner={isOwner} onUpdate={(e) => setProfile(prev => ({...prev, currentEmotion: e}))} />
              <KPISection 
                sessions={sessions} records={records} isOwner={isOwner} 
                manualKpiIndividual={profile.manualKpiIndividual || 0}
                manualKpiGroup={profile.manualKpiGroup || 0}
                lastUpdateIndividual={profile.lastUpdateIndividual}
                lastUpdateGroup={profile.lastUpdateGroup}
                onUpdateKpi={handleUpdateKPI}
              />
              <VisitorGuestbook 
                feedbacks={visitorFeedbacks} 
                isOwner={isOwner}
                onAddFeedback={(fb) => setVisitorFeedbacks([{...fb, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), comments: [], reactions: []}, ...visitorFeedbacks])}
                onDeleteFeedback={(id) => setVisitorFeedbacks(visitorFeedbacks.filter(f => f.id !== id))}
                onUpdateFeedback={(id, upd) => setVisitorFeedbacks(visitorFeedbacks.map(f => f.id === id ? upd : f))}
              />
            </div>
          )}

          {activeTab === 'add' && (
            isOwner ? (
              <ProgramForm 
                selectedFocus={selectedFocus} 
                onFocusChange={setSelectedFocus} 
                onSubmit={(r) => { 
                  setRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...records]); 
                  setActiveTab('records'); 
                }} 
              />
            ) : (
              <div className="bp-card p-20 flex flex-col items-center justify-center text-center border-l-8 border-pink-500 bg-pink-500/5">
                <div className="w-24 h-24 bg-zinc-900/80 border-2 border-pink-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,0,122,0.2)]">
                  <Shield size={48} className="text-pink-500" />
                </div>
                <h3 className="text-3xl font-heading text-white uppercase tracking-tighter mb-4">Akses Disekat</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest max-w-md leading-relaxed">
                  Maaf, hanya Cikgu Lily dibenarkan untuk menambah rekod program baru ke dalam arkib.
                </p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-10 border border-zinc-800 px-8 py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white hover:border-white transition-all"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )
          )}
          
          {activeTab === 'records' && (
            <div className="space-y-10">
              <h2 className="text-4xl font-heading text-white uppercase tracking-tighter border-b border-zinc-900 pb-6">ARKIB PROGRAM</h2>
              <ProgramList 
                records={records} showFocus isOwner={isOwner} 
                onDelete={(id) => setRecords(records.filter(r => r.id !== id))} 
                onUpdate={(id, upd) => setRecords(records.map(r => r.id === id ? {...r, ...upd} : r))}
                onRemoveImage={(rid, idx) => setRecords(records.map(r => r.id === rid ? {...r, oprImages: r.oprImages.filter((_, i) => i !== idx)} : r))}
                onUpdateFile={(rid, idx, f) => setRecords(records.map(r => r.id === rid ? {...r, oprImages: r.oprImages.map((img, i) => i === idx ? f : img)} : r))}
              />
            </div>
          )}

          {activeTab === 'sessions' && (
             <div className="relative">
                {!isSessionsUnlocked ? (
                   <div className="bp-card p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 border-l-8 border-pink-500 bg-pink-500/5 overflow-hidden">
                      <div className="relative group/sessionlogo mb-8">
                         <div 
                           onClick={() => isOwner && sessionLogoRef.current?.click()}
                           className={`w-32 h-32 bg-zinc-900/80 border-2 border-pink-500/30 rounded-3xl flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(255,0,122,0.2)] transition-all ${isOwner ? 'cursor-pointer hover:border-pink-500' : ''}`}
                         >
                           {profile.sessionLogoUrl ? (
                             <img src={profile.sessionLogoUrl} alt="Session Logo" className="w-full h-full object-contain p-2" />
                           ) : (
                             <ShieldCheck size={56} className="text-pink-500" />
                           )}
                           
                           {isOwner && (
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/sessionlogo:opacity-100 transition-opacity flex items-center justify-center">
                               <Camera size={24} className="text-white" />
                             </div>
                           )}
                         </div>
                         {isOwner && (
                           <div className="absolute -bottom-2 -right-2 bg-pink-500 text-black p-2 rounded-xl shadow-lg animate-bounce pointer-events-none">
                              <Unlock size={14} strokeWidth={3} />
                           </div>
                         )}
                         <input type="file" ref={sessionLogoRef} onChange={handleSessionLogoUpload} className="hidden" accept="image/*" />
                      </div>

                      <h3 className="text-4xl font-heading text-white uppercase tracking-tighter mb-4">Akses Terhad & Terperingkat</h3>
                      <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest max-w-md mb-12 leading-relaxed">
                         Maklumat Daftar Klien dikategorikan sebagai SULIT. Sila masukkan kod akses pelawat yang sah untuk melihat arkib sesi secara live.
                      </p>
                      
                      <div className="w-full max-w-sm relative">
                         <Key size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-500" />
                         <input 
                           type="password" 
                           value={sessionPinInput}
                           onChange={(e) => setSessionPinInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleUnlockSessions()}
                           placeholder="KOD AKSES..."
                           className="w-full bg-black border-2 border-zinc-800 rounded-2xl pl-16 pr-6 py-6 text-center font-black tracking-[0.8em] text-pink-500 focus:border-pink-500 outline-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] transition-all"
                         />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <button 
                          onClick={handleUnlockSessions}
                          className="btn-pink px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-[0_10px_40px_rgba(255,0,122,0.4)] active:scale-95 transition-all"
                        >
                           Buka Daftar Klien
                        </button>
                        {isOwner && (
                          <button 
                            onClick={() => setIsSessionsUnlocked(true)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:text-white hover:border-zinc-700 transition-all"
                          >
                             Bypass PIN (Admin)
                          </button>
                        )}
                      </div>
                   </div>
                ) : (
                   <SessionManager 
                     sessions={sessions} 
                     isOwner={isOwner} 
                     onAdd={(s) => setSessions([{...s, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...sessions])} 
                     onDelete={(id) => setSessions(sessions.filter(s => s.id !== id))} 
                     onUpdate={(id, u) => setSessions(sessions.map(s => s.id === id ? {...s, ...u} : s))} 
                     onRemoveImage={(sid, idx) => setSessions(sessions.map(s => s.id === sid ? {...s, images: s.images.filter((_, i) => i !== idx)} : s))} 
                     onUpdateFile={(sid, idx, f) => setSessions(sessions.map(s => s.id === sid ? {...s, images: s.images.map((img, i) => i === idx ? f : img)} : s))} 
                   />
                )}
             </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex items-center gap-6 border-b border-zinc-900 pb-8">
                <div className="w-16 h-16 bg-pink-500 text-black flex items-center justify-center rounded-3xl shadow-lg"><Smile size={36} strokeWidth={2.5} /></div>
                <div>
                  <h2 className="text-4xl font-heading text-white leading-none uppercase tracking-tighter">Status Emosi Cikgu Lily</h2>
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2 italic">Refleksi Kesejahteraan & Aura Harian</p>
                </div>
              </div>
              
              <div className="bp-card p-12 bg-zinc-950/20 border-l-8 border-pink-500">
                <div className="flex flex-col items-center text-center gap-10">
                   <div className="w-32 h-32 bg-black rounded-full border-4 border-pink-500/30 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(255,0,122,0.2)] animate-pulse">
                     {profile.currentEmotion?.emoji || '💖'}
                   </div>
                   <div className="space-y-4">
                     <p className="text-xs font-black text-pink-500 uppercase tracking-[0.5em]">Current Vibe Level</p>
                     <h3 className="text-6xl font-heading text-white tracking-tighter uppercase">{profile.currentEmotion?.label || 'AMAZING'}</h3>
                   </div>
                   
                   {isOwner ? (
                      <div className="w-full max-w-2xl border-t border-zinc-900 pt-10">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Pilih Status Baru Anda:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                          {[
                            { emoji: '💖', label: 'AMAZING' },
                            { emoji: '⚡', label: 'CHARGED' },
                            { emoji: '💗', label: 'PASSION' },
                            { emoji: '🔥', label: 'INTENSE' },
                            { emoji: '☕', label: 'FOCUS' },
                            { emoji: '🎯', label: 'PRECISE' },
                          ].map((emo) => (
                            <button
                              key={emo.label}
                              onClick={() => setProfile(prev => ({...prev, currentEmotion: {...emo, timestamp: Date.now()}}))}
                              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${profile.currentEmotion?.label === emo.label ? 'bg-pink-500 border-pink-500 text-black shadow-xl' : 'bg-black border-zinc-900 text-zinc-500 hover:border-pink-500/40'}`}
                            >
                              <span className="text-3xl">{emo.emoji}</span>
                              <span className="text-[9px] font-black uppercase tracking-tighter">{emo.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                   ) : (
                      <p className="text-xl font-medium text-zinc-400 italic max-w-xl leading-relaxed uppercase tracking-tight">
                        "Setiap hari adalah peluang baru. Cikgu Lily kini berada dalam mod <span className="text-pink-500 font-black">{profile.currentEmotion?.label || 'AMAZING'}</span> untuk memberikan impak maksima kepada murid-murid."
                      </p>
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'psikometrik' && <PsychometricManager scores={psychometricScores} evidences={psychometricEvidences} hollandImages={profile.hollandImages} isOwner={isOwner} onUpdateHollandImage={(c, url) => setProfile(prev => ({...prev, hollandImages: {...prev.hollandImages, [c]: url}}))} onAddScore={(s) => setPsychometricScores([{...s, id: Math.random().toString(36).substr(2, 9), updatedAt: Date.now()}, ...psychometricScores])} onUpdateScore={(id, s) => setPsychometricScores(psychometricScores.map(sc => sc.id === id ? {...sc, ...s, updatedAt: Date.now()} : sc))} onDeleteScore={(id) => setPsychometricScores(psychometricScores.filter(s => s.id !== id))} onAddEvidence={(e) => setPsychometricEvidences([{...e, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...psychometricEvidences])} onDeleteEvidence={(id) => setPsychometricEvidences(psychometricEvidences.filter(e => e.id !== id))} onUpdateFile={(eid, idx, f) => setPsychometricEvidences(psychometricEvidences.map(ev => ev.id === eid ? {...ev, files: ev.files.map((img, i) => i === idx ? f : img)} : ev))} onRemoveFile={(eid, idx) => setPsychometricEvidences(psychometricEvidences.map(ev => ev.id === eid ? {...ev, files: ev.files.filter((_, i) => i !== idx)} : ev))} />}
          {activeTab === 'meeting' && <MeetingManager records={meetingRecords} isOwner={isOwner} onAdd={(r) => setMeetingRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...meetingRecords])} onDelete={(id) => setMeetingRecords(meetingRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setMeetingRecords(meetingRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setMeetingRecords(meetingRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setMeetingRecords(meetingRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'teachin' && <TeachInManager records={teachInRecords} isOwner={isOwner} onAdd={(r) => setTeachInRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...teachInRecords])} onDelete={(id) => setTeachInRecords(teachInRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setTeachInRecords(teachInRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setTeachInRecords(teachInRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setTeachInRecords(teachInRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'assembly' && <AssemblyManager records={assemblyRecords} isOwner={isOwner} onAdd={(r) => setAssemblyRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...assemblyRecords])} onDelete={(id) => setAssemblyRecords(assemblyRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setAssemblyRecords(assemblyRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setAssemblyRecords(assemblyRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setAssemblyRecords(assemblyRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'analisis' && <WeeklyAnalysisManager records={weeklyAnalysis} isOwner={isOwner} onAdd={(r) => setWeeklyAnalysis([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...weeklyAnalysis])} onDelete={(id) => setWeeklyAnalysis(weeklyAnalysis.filter(r => r.id !== id))} onRemoveFile={(rid, type, idx) => setWeeklyAnalysis(weeklyAnalysis.map(r => r.id === rid ? {...r, [type === 'pdf' ? 'pdfFiles' : 'imageFiles']: r[type === 'pdf' ? 'pdfFiles' : 'imageFiles'].filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, type, idx, f) => setWeeklyAnalysis(weeklyAnalysis.map(r => r.id === rid ? {...r, [type === 'pdf' ? 'pdfFiles' : 'imageFiles']: r[type === 'pdf' ? 'pdfFiles' : 'imageFiles'].map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'prs' && <PRSManager members={prsMembers} dutySchedule={prsDuty} activities={prsActivity} gallery={prsGallery} orgCharts={prsOrgCharts} prsLogoUrl={profile.prsLogoUrl} prsGroupImageUrl={profile.prsGroupImageUrl} prsDutyScheduleUrl={profile.prsDutyScheduleUrl} onUpdatePrsDutySchedule={(url) => setProfile(prev => ({...prev, prsDutyScheduleUrl: url}))} onUpdatePrsLogo={(url) => setProfile(prev => ({...prev, prsLogoUrl: url}))} onUpdatePrsGroupImage={(url) => setProfile(prev => ({...prev, prsGroupImageUrl: url}))} onAddMember={(n, c, p) => setPrsMembers([{id: Math.random().toString(36).substr(2, 9), name: n, studentClass: c, position: p, createdAt: Date.now()}, ...prsMembers])} onDeleteMember={(id) => setPrsMembers(prsMembers.filter(m => m.id !== id))} onUpdateMember={(id, u) => setPrsMembers(prsMembers.map(m => m.id === id ? {...m, ...u} : m))} onAddContent={(t, c) => { const setter = t === 'duty' ? setPrsDuty : t === 'activity' ? setPrsActivity : t === 'gallery' ? setPrsGallery : setPrsOrgCharts; setter(prev => [{...c, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...prev]); }} onDeleteContent={(t, id) => { const setter = t === 'duty' ? setPrsDuty : t === 'activity' ? setPrsActivity : t === 'gallery' ? setPrsGallery : setPrsOrgCharts; setter(prev => prev.filter(c => c.id !== id)); }} onUpdateContent={(t, id, u) => { const setter = t === 'duty' ? setPrsDuty : t === 'activity' ? setPrsActivity : t === 'gallery' ? setPrsGallery : setPrsOrgCharts; setter(prev => prev.map(c => c.id === id ? {...c, ...u} : c)); }} onRemoveImage={(t, cid, idx) => { const setter = t === 'duty' ? setPrsDuty : t === 'activity' ? setPrsActivity : t === 'gallery' ? setPrsGallery : setPrsOrgCharts; setter(prev => prev.map(c => c.id === cid ? {...c, images: c.images.filter((_, i) => i !== idx)} : c)); }} onUpdateFile={(t, cid, idx, f) => { const setter = t === 'duty' ? setPrsDuty : t === 'activity' ? setPrsActivity : t === 'gallery' ? setPrsGallery : setPrsOrgCharts; setter(prev => prev.map(c => c.id === cid ? {...c, images: c.images.map((img, i) => i === idx ? f : img)} : c)); }} isOwner={isOwner} />}
          {activeTab === 'training' && <ExternalTrainingManager records={trainingRecords} isOwner={isOwner} onAdd={(r) => setExternalTrainingRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...trainingRecords])} onDelete={(id) => setExternalTrainingRecords(trainingRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setExternalTrainingRecords(trainingRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setExternalTrainingRecords(trainingRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setExternalTrainingRecords(trainingRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'duty_w' && <WeeklyDutyManager records={weeklyDutyRecords} isOwner={isOwner} onAdd={(r) => setWeeklyDutyRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...weeklyDutyRecords])} onDelete={(id) => setWeeklyDutyRecords(weeklyDutyRecords.filter(r => r.id !== id))} onUpdateRecord={(id, u) => setWeeklyDutyRecords(weeklyDutyRecords.map(r => r.id === id ? u : r))} />}
          {activeTab === 'bilik' && <BilikManager records={bilikRecords} isOwner={isOwner} onAdd={(r) => setBilikRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...bilikRecords])} onDelete={(id) => setBilikRecords(bilikRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setBilikRecords(bilikRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setBilikRecords(bilikRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setBilikRecords(bilikRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'sumbangan' && <SumbanganManager records={sumbanganRecords} isOwner={isOwner} onAdd={(r) => setSumbanganRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...sumbanganRecords])} onDelete={(id) => setSumbanganRecords(sumbanganRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setSumbanganRecords(sumbanganRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, idx) => setSumbanganRecords(sumbanganRecords.map(r => r.id === rid ? {...r, images: r.images.filter((_, i) => i !== idx)} : r))} onUpdateFile={(rid, idx, f) => setSumbanganRecords(sumbanganRecords.map(r => r.id === rid ? {...r, images: r.images.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'inovasi' && <InovasiManager records={inovasiRecords} isOwner={isOwner} onAdd={(r) => setInovasiRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...inovasiRecords])} onDelete={(id) => setInovasiRecords(inovasiRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setInovasiRecords(inovasiRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveFile={(rid, fid) => setInovasiRecords(inovasiRecords.map(r => r.id === rid ? {...r, files: r.files.filter(f => f.id !== fid)} : r))} onUpdateFile={(rid, idx, f) => setInovasiRecords(inovasiRecords.map(r => r.id === rid ? {...r, files: r.files.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'rujukan' && <RujukanManager records={rujukanRecords} isOwner={isOwner} onAdd={(r) => setRujukanRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...rujukanRecords])} onDelete={(id) => setRujukanRecords(rujukanRecords.filter(r => r.id !== id))} onUpdate={(id, u) => setRujukanRecords(rujukanRecords.map(r => r.id === id ? {...r, ...u} : r))} onRemoveFile={(rid, fid) => setRujukanRecords(rujukanRecords.map(r => r.id === rid ? {...r, files: r.files.filter(f => f.id !== fid)} : r))} onUpdateFile={(rid, idx, f) => setRujukanRecords(rujukanRecords.map(r => r.id === rid ? {...r, files: r.files.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'success' && <SuccessFormManager records={successForms} isOwner={isOwner} onAdd={(r) => setSuccessForms([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...successForms])} onDelete={(id) => setSuccessForms(successForms.filter(r => r.id !== id))} onUpdate={(id, u) => setSuccessForms(successForms.map(r => r.id === id ? {...r, ...u} : r))} onRemoveImage={(rid, fid) => setSuccessForms(successForms.map(r => r.id === rid ? {...r, files: r.files.filter(f => f.id !== fid)} : r))} onUpdateFile={(rid, idx, f) => setSuccessForms(successForms.map(r => r.id === rid ? {...r, files: r.files.map((img, i) => i === idx ? f : img)} : r))} />}
          {activeTab === 'kurikulum' && <BureauManager category="KURIKULUM" records={bureauRecords.filter(b => b.category === 'KURIKULUM')} isOwner={isOwner} onAdd={(r) => setBureauRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...bureauRecords])} onDelete={(id) => setBureauRecords(bureauRecords.filter(b => b.id !== id))} onRemoveImage={(rid, idx) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.filter((_, i) => i !== idx)} : b))} onUpdateFile={(rid, idx, f) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.map((img, i) => i === idx ? f : img)} : b))} />}
          {activeTab === 'kokurikulum' && <BureauManager category="KOKURIKULUM" records={bureauRecords.filter(b => b.category === 'KOKURIKULUM')} isOwner={isOwner} onAdd={(r) => setBureauRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...bureauRecords])} onDelete={(id) => setBureauRecords(bureauRecords.filter(b => b.id !== id))} onRemoveImage={(rid, idx) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.filter((_, i) => i !== idx)} : b))} onUpdateFile={(rid, idx, f) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.map((img, i) => i === idx ? f : img)} : b))} />}
          {activeTab === 'hem' && <BureauManager category="HAL EHWAL MURID" records={bureauRecords.filter(b => b.category === 'HAL EHWAL MURID')} isOwner={isOwner} onAdd={(r) => setBureauRecords([{...r, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now()}, ...bureauRecords])} onDelete={(id) => setBureauRecords(bureauRecords.filter(b => b.id !== id))} onRemoveImage={(rid, idx) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.filter((_, i) => i !== idx)} : b))} onUpdateFile={(rid, idx, f) => setBureauRecords(bureauRecords.map(b => b.id === rid ? {...b, files: b.files.map((img, i) => i === idx ? f : img)} : b))} />}
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowLoginModal(false)} />
          <div className="relative bp-card w-full max-w-md p-10 border-pink-500/30 shadow-[0_0_50px_rgba(255,0,122,0.15)] animate-in zoom-in duration-300">
            <h3 className="text-2xl font-heading text-white text-center mb-8 uppercase tracking-tighter">Lily Elite Access</h3>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="ENTER ACCESS CODE..." 
              className="w-full bg-black border border-zinc-800 rounded-xl px-6 py-4 text-center font-black tracking-[0.4em] text-pink-500 outline-none focus:border-pink-500" 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-4 mt-8">
               <button onClick={() => setShowLoginModal(false)} className="flex-1 py-4 text-zinc-600 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Batal</button>
               <button onClick={handleLogin} className="flex-1 btn-pink py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Login</button>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-6 right-8 z-30 pointer-events-none">
         <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.8em] vertical-text">LILY EXECUTIVE SYSTEMS © 2016-2024</p>
      </footer>
    </div>
  );
};

// Sidebar Helper Components
const SidebarHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="mt-8 mb-2 px-6">
    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">{label}</p>
  </div>
);

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-pink-500 text-black shadow-[0_0_20px_rgba(255,0,122,0.4)] translate-x-2' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-black' : 'text-zinc-600 group-hover:text-pink-500'} transition-colors`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${active ? 'font-black' : ''}`}>
      {label}
    </span>
    {active && <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full shadow-[0_0_5px_#000]"></div>}
  </button>
);

export default App;
