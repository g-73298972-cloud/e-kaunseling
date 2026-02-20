
import React, { useEffect, useState } from 'react';
import { FileAttachment, Comment, Reaction } from '../types';
import { X, Maximize2, MessageSquare, Trash2, FileText, Download, Search, ExternalLink, AlertCircle } from 'lucide-react';
import CommentSection from './CommentSection';

interface FileViewModalProps {
  file: FileAttachment;
  onClose: () => void;
  onAddComment: (text: string, userName: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReaction: (emoji: string) => void;
  onDeleteFile?: () => void;
  isOwner: boolean;
  type: 'image' | 'pdf';
}

const FileViewModal: React.FC<FileViewModalProps> = ({ 
  file, onClose, onAddComment, onDeleteComment, onAddReaction, onDeleteFile, isOwner, type 
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.url.startsWith('data:')) {
      try {
        const parts = file.url.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => {
          if (url) URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error("Failed to create blob URL", e);
        setBlobUrl(null);
      }
    } else {
      setBlobUrl(file.url);
    }
  }, [file.url]);

  const handleOpenFull = () => {
    const targetUrl = blobUrl || file.url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDeleteFile && window.confirm('Hapus rekod ini secara kekal?')) {
      onDeleteFile();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bp-card w-full max-w-6xl h-[95vh] md:h-[90vh] border border-zinc-800 overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Left: Content Display */}
        <div className="flex-[2] bg-black relative flex flex-col min-h-[50vh] md:min-h-0 border-r border-zinc-900">
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="bg-pink-500 text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl pointer-events-auto">
              {type === 'image' ? 'Visual Evidence' : 'Document Archive'}
            </div>

            <div className="flex gap-2 pointer-events-auto">
               <button onClick={handleOpenFull} title="Buka Fail" className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-black transition-all shadow-xl">
                 <ExternalLink size={18} />
               </button>
               {isOwner && onDeleteFile && (
                 <button onClick={handleDelete} title="Padam Fail" className="w-10 h-10 bg-zinc-900 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl">
                   <Trash2 size={18} />
                 </button>
               )}
               <button onClick={onClose} title="Tutup" className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
                 <X size={18} />
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 md:p-12 relative">
            {type === 'image' ? (
              <img src={file.url} className="max-w-full max-h-full object-contain border border-zinc-800 rounded-2xl shadow-2xl" alt="Evidence" />
            ) : (
              <div className="w-full h-full pt-12 flex flex-col items-center justify-center gap-6">
                 {/* Main PDF Object - More robust than iframe for Chrome */}
                 <object 
                    data={blobUrl || file.url} 
                    type="application/pdf" 
                    className="w-full h-full border border-zinc-800 bg-white rounded-2xl shadow-2xl"
                 >
                    {/* Fallback inside object tag if it fails to render */}
                    <div className="w-full h-full bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-zinc-900">
                        <AlertCircle size={48} className="text-zinc-800 mb-4" />
                        <h4 className="text-xl font-heading text-white mb-2">Paparan PDF Disekat</h4>
                        <p className="text-zinc-500 text-sm max-w-xs mb-6 uppercase font-bold tracking-tight">Pelayar anda menyekat pratinjau PDF. Sila gunakan butang di bawah untuk membuka fail.</p>
                        <button 
                          onClick={handleOpenFull}
                          className="btn-pink px-8 py-4 rounded-xl flex items-center gap-3 text-sm"
                        >
                          <ExternalLink size={18} /> Buka PDF Sekarang
                        </button>
                    </div>
                 </object>
                 
                 {/* Always visible secondary link for better UX */}
                 <div className="flex items-center gap-3 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sekatan Paparan?</span>
                    <button 
                      onClick={handleOpenFull}
                      className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Buka Di Tab Baru <ExternalLink size={10} />
                    </button>
                 </div>
              </div>
            )}
          </div>
          
          {/* Footer Label */}
          <div className="bg-zinc-950 p-3 text-center border-t border-zinc-900">
             <span className="text-[8px] font-black text-zinc-700 tracking-[0.5em] uppercase">LILY EXECUTIVE CONTROL CENTER</span>
          </div>
        </div>

        {/* Right: Interaction Section */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
          <div className="p-8 border-b border-zinc-900">
            <h3 className="text-xl font-heading text-white flex items-center gap-3">
              <MessageSquare size={20} className="text-pink-500" />
              Log Interaksi
            </h3>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">
              Komen & Maklum Balas
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <CommentSection 
              comments={file.comments} 
              reactions={file.reactions} 
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onAddReaction={onAddReaction}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewModal;
