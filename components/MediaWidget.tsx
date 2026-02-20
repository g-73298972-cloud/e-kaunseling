
import React, { useRef, useState } from 'react';
import { MediaRecord } from '../types';
import { Play, Music, Film, Upload, Trash2, Volume2, X, Plus, Maximize2, MonitorPlay } from 'lucide-react';

interface MediaWidgetProps {
  media: MediaRecord[];
  onUpload: (record: Omit<MediaRecord, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

const MediaWidget: React.FC<MediaWidgetProps> = ({ media, onUpload, onDelete, isOwner }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [selectedVideo, setSelectedVideo] = useState<MediaRecord | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpload({
            url: reader.result as string,
            name: file.name.toUpperCase(),
            mimeType: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const filteredMedia = media.filter(m => {
    if (filter === 'video') return m.mimeType.startsWith('video/');
    if (filter === 'audio') return m.mimeType.startsWith('audio/');
    return true;
  });

  return (
    <div className="bp-card p-8 border-l-4 border-pink-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <h3 className="text-2xl font-heading text-white flex items-center gap-3 italic">
            <Volume2 className="text-pink-500" /> ELITE MEDIA CORNER
          </h3>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Koleksi Lagu & Video Inspirasi Cikgu Lily</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
            {(['all', 'video', 'audio'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filter === t ? 'bg-pink-500 text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {isOwner && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-pink px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black shadow-[0_0_15px_rgba(255,0,122,0.3)]"
            >
              <Plus size={14} /> UPLOAD
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,audio/*" multiple />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-900 rounded-3xl bg-black/20">
             <Music size={48} className="mx-auto text-zinc-800 mb-4" />
             <p className="text-zinc-700 font-bold uppercase text-[10px] tracking-[0.3em]">Ruang Media Masih Kosong</p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div key={item.id} className="group relative bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all shadow-xl">
              <div className="aspect-video bg-black flex items-center justify-center relative">
                {item.mimeType.startsWith('video/') ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <button 
                         onClick={() => setSelectedVideo(item)}
                         className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-black shadow-2xl scale-90 group-hover:scale-100 transition-transform"
                       >
                         <Play size={24} fill="currentColor" />
                       </button>
                    </div>
                    <button 
                      onClick={() => setSelectedVideo(item)}
                      className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/30 rounded-full flex items-center justify-center text-pink-500 animate-pulse">
                       <Music size={32} />
                    </div>
                    <audio src={item.url} controls className="h-8 max-w-[200px]" />
                  </div>
                )}
                
                {isOwner && (
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-zinc-400 hover:text-red-500 border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="p-4 border-t border-zinc-900 flex items-center gap-3">
                 {item.mimeType.startsWith('video/') ? <Film size={14} className="text-pink-500" /> : <Music size={14} className="text-pink-500" />}
                 <span className="text-[9px] font-black text-white truncate uppercase tracking-tighter flex-1">{item.name}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Video Theater Mode */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_100px_rgba(255,0,122,0.2)] animate-in zoom-in duration-300">
            <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
               <div className="bg-pink-500 text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 pointer-events-auto shadow-xl">
                 <MonitorPlay size={14} /> Theater Mode
               </div>
               <button 
                 onClick={() => setSelectedVideo(null)}
                 className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all pointer-events-auto shadow-xl border border-white/10"
               >
                 <X size={20} />
               </button>
            </div>
            
            <video 
              src={selectedVideo.url} 
              className="w-full h-full" 
              controls 
              autoPlay
              playsInline
            />
            
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
               <h4 className="text-white font-heading text-xl uppercase tracking-tighter">{selectedVideo.name}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaWidget;
