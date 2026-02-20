export enum FocusArea {
  SAHSIAH = 'Pembangunan dan pengembangan sahsiah diri murid',
  DISIPLIN = 'Peningkatan disiplin diri murid',
  KERJAYA = 'Pendidikan Kerjaya murid',
  PSIKOSOSIAL = 'Psikososial dan kesejahteraan mental murid'
}

export type SumbanganCategory = 'KURIKULUM' | 'KOKURIKULUM' | 'HAL EHWAL MURID';
export type SumbanganType = 'DALAM SEKOLAH' | 'LUAR SEKOLAH';
export type SumbanganLevel = 'DAERAH' | 'NEGERI' | 'KEBANGSAAN' | 'ANTARABANGSA';

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface FileAttachment {
  id: string;
  url: string;
  name?: string;
  mimeType?: string;
  comments: Comment[];
  reactions: Reaction[];
  dutyDetails?: {
    date: string;
    time: string;
    location: string;
  };
}

export interface ProgramRecord {
  id: string;
  focusArea: FocusArea;
  namaProgram: string;
  tarikhMula: string;
  tarikhTamat: string;
  tempat: string;
  sasaran: string;
  penyelaras: string;
  sumbangan: string; 
  oprImages: FileAttachment[];
  createdAt: number;
}

export interface VisitorFeedback {
  id: string;
  name: string;
  comment: string;
  rating: number;
  timestamp: number;
  comments: Comment[];
  reactions: Reaction[];
}

export interface SumbanganRecord {
  id: string;
  type: SumbanganType;
  namaProgram: string;
  tarikh?: string;
  sumbanganRole?: string;
  peringkat?: SumbanganLevel;
  tugas?: string;
  files: FileAttachment[];
  createdAt: number;
}

export interface BureauRecord {
  id: string;
  category: SumbanganCategory;
  jawatankuasa: string;
  jawatan: string;
  files: FileAttachment[];
  createdAt: number;
}

export interface DayLog {
  day: string;
  images: FileAttachment[];
}

export interface WeeklyDutyRecord {
  id: string;
  weekNumber: number;
  weekRange: string;
  scheduleImages: FileAttachment[];
  dayLogs: DayLog[];
  createdAt: number;
}

export interface SessionEntry {
  id: string;
  caption: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface InovasiRecord {
  id: string;
  title: string;
  description: string;
  files: FileAttachment[];
  createdAt: number;
}

export interface RujukanLink {
  id: string;
  url: string;
  label: string;
}

export interface RujukanRecord {
  id: string;
  title: string;
  description: string;
  files: FileAttachment[];
  links: RujukanLink[];
  createdAt: number;
}

export interface BilikRecord {
  id: string;
  caption: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface TeachInRecord {
  id: string;
  tarikh: string;
  masa: string;
  kelas: string;
  catatan: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface AssemblyRecord {
  id: string;
  tarikh: string;
  masa: string;
  catatan: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface MeetingRecord {
  id: string;
  tarikh: string;
  masa: string;
  tempat: string;
  namaMesyuarat: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface ExternalTrainingRecord {
  id: string;
  namaProgram: string;
  tarikh: string;
  tempat: string;
  anjuran: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface SuccessFormRecord {
  id: string;
  title: string;
  files: FileAttachment[];
  createdAt: number;
}

export interface WeeklyAnalysis {
  id: string;
  weekNumber: number;
  pdfFiles: FileAttachment[];
  imageFiles: FileAttachment[];
  createdAt: number;
}

export interface PRSMember {
  id: string;
  name: string;
  studentClass: string;
  position: string;
  createdAt: number;
}

export interface PRSContent {
  id: string;
  caption: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface PsychometricScore {
  id: string;
  className: string;
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  totalStudents: number;
  answeredCount: number;
  updatedAt: number;
}

export interface PsychometricEvidence {
  id: string;
  title: string;
  files: FileAttachment[];
  createdAt: number;
}

export interface UserEmotion {
  emoji: string;
  label: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  since: string;
  quote: string;
  avatarUrl: string | null;
  logoUrl?: string | null;
  sidebarBgUrl?: string | null;
  schoolLogoUrl?: string | null;
  schoolName?: string;
  prsLogoUrl?: string | null;
  prsGroupImageUrl?: string | null;
  prsDutyScheduleUrl?: string | null;
  sessionLogoUrl?: string | null;
  hollandImages?: Record<string, string>;
  jadualUrls: FileAttachment[];
  takwimUrls: FileAttachment[];
  currentEmotion?: UserEmotion;
  manualKpiIndividual?: number;
  manualKpiGroup?: number;
  lastUpdateIndividual?: number;
  lastUpdateGroup?: number;
}

export interface DailyDutyRecord {
  id: string;
  tarikh: string;
  lokasi: string;
  masa: string;
  images: FileAttachment[];
  createdAt: number;
}

export interface MediaRecord {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  createdAt: number;
}