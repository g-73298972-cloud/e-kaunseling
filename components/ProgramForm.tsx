
import React, { useState, useRef } from 'react';
import { FocusArea, ProgramRecord, FileAttachment } from '../types';
import { Send, FileText, User, Calendar, MapPin, Image as ImageIcon, X, Plus, HeartHandshake, Eye, Users } from 'lucide-react';

interface ProgramFormProps {
  onSubmit: (record: Omit<ProgramRecord, 'id' | 'createdAt'>) => void;
  selectedFocus: FocusArea;
  onFocusChange: (focus: FocusArea) => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ onSubmit, selectedFocus, onFocusChange }) => {
  const [formData, setFormData] = useState({
    namaProgram: '',
    tarikhMula: '',
    tarikhTamat: '',
    tempat: '',
    sasaran: '',
    penyelaras: '',
    sumbangan: 'PENYELARAS',
  });
  const [oprImages, setOprImages] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  const handleSumbanganSelect = (val: string) => {
    setFormData(prev => ({ ...prev, sumbangan: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            name: file.name.toUpperCase(),
            mimeType: file.type,
            comments: [],
            reactions: []
          };
          setOprImages(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setOprImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaProgram || !formData.tarikhMula || !formData.tarikhTamat || !formData.penyelaras) {
      alert("Sila lengkapkan maklumat wajib (Nama, Tarikh Mula, Tarikh Tamat, Penyelaras).");
      return;
    }
    onSubmit({
      ...formData,
      focusArea: selectedFocus,
      oprImages: oprImages
    });
    setFormData({
      namaProgram: '',
      tarikhMula: '',
      tarikhTamat: '',
      tempat: '',
      sasaran: '',
      penyelaras: '',
      sumbangan: 'PENYELARAS',
    });
    setOprImages([]);
  };

  const sumbanganOptions = ['PENYELARAS', 'PENGENDALI SLOT', 'AJK'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Form Input */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <MapPin size={14} /> Pilih Fokus Perkhidmatan
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(FocusArea).map(area => (
              <button
                key={area}
                type="button"
                onClick={() => onFocusChange(area)}
                className={`text-left px-4 py-3 rounded-xl border transition-all text-[10px] font-black tracking-widest ${
                  selectedFocus === area 
                  ? 'bg-pink-500 border-pink-500 text-black shadow-lg' 
                  : 'bg-black border-zinc-800 text-zinc-500 hover:border-pink-500/50'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <FileText size={14} /> Nama Program
          </label>
          <input 
            type="text" name="namaProgram" value={formData.namaProgram} onChange={handleInputChange}
            placeholder="TAIP NAMA PROGRAM DI SINI..."
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Calendar size={14} /> Tarikh Mula
            </label>
            <input 
              type="date" name="tarikhMula" value={formData.tarikhMula} onChange={handleInputChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-pink-500 outline-none transition-all text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Calendar size={14} /> Tarikh Tamat
            </label>
            <input 
              type="date" name="tarikhTamat" value={formData.tarikhTamat} onChange={handleInputChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-pink-500 outline-none transition-all text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <MapPin size={14} /> Tempat
            </label>
            <input 
              type="text" name="tempat" value={formData.tempat} onChange={handleInputChange}
              placeholder="LOKASI PROGRAM..."
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Users size={14} /> Sasaran
            </label>
            <input 
              type="text" name="sasaran" value={formData.sasaran} onChange={handleInputChange}
              placeholder="E.G. SEMUA MURID T5..."
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <User size={14} /> Penyelaras
          </label>
          <input 
            type="text" name="penyelaras" value={formData.penyelaras} onChange={handleInputChange}
            placeholder="NAMA PENYELARAS..."
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-pink-500 outline-none transition-all uppercase text-white"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <HeartHandshake size={14} /> Peranan
          </label>
          <div className="flex flex-wrap gap-2">
            {sumbanganOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSumbanganSelect(opt)}
                className={`px-4 py-2.5 rounded-xl border text-[10px] font-black tracking-widest transition-all ${
                  formData.sumbangan === opt 
                  ? 'bg-pink-500 border-pink-500 text-black shadow-lg' 
                  : 'bg-black border-zinc-800 text-zinc-500 hover:border-pink-500/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <ImageIcon size={14} /> Muat Naik Evidens (JPG, PNG, GIF, PDF)
          </label>
          <div className="flex flex-wrap gap-3 mt-2 p-4 border-2 border-dashed border-zinc-800 bg-black rounded-2xl">
            {oprImages.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                {file.mimeType?.includes('pdf') ? (
                  <FileText size={32} className="text-pink-500" />
                ) : (
                  <img src={file.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                )}
                <button 
                  type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md shadow-lg hover:scale-110 transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-pink-500 transition-all text-zinc-700 hover:text-pink-500 bg-zinc-950/50"
            >
              <Plus size={24} />
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*,.pdf" multiple />
        </div>

        <button 
          type="submit"
          className="w-full btn-pink py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all tracking-[0.2em] text-xs font-black uppercase"
        >
          <Send size={18} /> SIMPAN REKOD PROGRAM
        </button>
      </form>

      {/* Right: Live Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-pink-500">
          <Eye size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest">Pratonton Rekod (Live)</h3>
        </div>
        <div className="bg-zinc-950/50 p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-900 min-h-[500px]">
          <div className="bp-card overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase px-3 py-1 rounded-md bg-pink-500/10 text-pink-500 border border-pink-500/20 inline-block">
                  {selectedFocus}
                </span>
                <h4 className="text-3xl font-heading text-white uppercase leading-none tracking-tighter">
                  {formData.namaProgram || 'NAMA PROGRAM'}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-6 py-6 border-y border-zinc-900">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tempat & Sasaran</p>
                  <p className="text-sm font-bold text-white uppercase">
                    {formData.tempat || '-'} • {formData.sasaran || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Julat Tarikh</p>
                  <p className="text-sm font-bold text-white uppercase">
                    {formData.tarikhMula ? `${formData.tarikhMula} - ${formData.tarikhTamat || '...'}` : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Penyelaras</p>
                  <p className="text-sm font-bold text-white uppercase">{formData.penyelaras || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Peranan</p>
                  <p className="text-sm font-black text-pink-500 uppercase">{formData.sumbangan}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Lampiran Evidens ({oprImages.length})</p>
                {oprImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {oprImages.map((file, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                        {file.mimeType?.includes('pdf') ? (
                          <FileText size={20} className="text-pink-500" />
                        ) : (
                          <img src={file.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 bg-black/40 rounded-2xl border border-dashed border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                    TIADA GAMBAR/FAIL
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;
