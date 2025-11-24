import React, { useRef, useState } from 'react';
import { ImageState } from '../types';

interface PreviewAreaProps {
  imageState: ImageState;
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  imageState,
  onImageUpload,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Basic validation for image type
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const hasImage = !!imageState.current;
  const isModified = imageState.original && imageState.current && imageState.original !== imageState.current;

  // Render Empty State
  if (!hasImage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-8 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div 
          onClick={triggerUpload}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative z-10 w-full max-w-xl h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 group animate-reveal 
            ${isDragging 
              ? 'border-yellow-500 bg-zinc-900/80 scale-105 shadow-2xl shadow-yellow-500/10' 
              : 'border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-900/50'
            }`}
        >
          <div className={`w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-xl shadow-black/50 pointer-events-none ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
            <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-yellow-400' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={`text-xl font-medium mb-2 font-serif transition-colors pointer-events-none ${isDragging ? 'text-yellow-400' : 'text-white'}`}>
             {isDragging ? 'أفلت الصورة هنا' : 'رفع صورة المنتج'}
          </h3>
          <p className={`text-zinc-500 text-center max-w-xs pointer-events-none transition-colors ${isDragging ? 'text-zinc-400' : ''}`}>
            أفلت صورتك هنا أو انقر للتصفح. الصيغ المدعومة: JPG, PNG, WEBP.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
    );
  }

  // Render Image Preview
  return (
    <div className="flex-1 bg-zinc-950 relative flex items-center justify-center p-4 lg:p-12 overflow-hidden select-none">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
        <div className="relative shadow-2xl shadow-black rounded-lg overflow-hidden ring-1 ring-white/10 transition-all duration-500 max-h-[85vh] max-w-full">
          
          {/* Base Image (Edited/Current) - Shown on the LEFT in RTL split */}
          <img 
            src={imageState.current!} 
            alt="Edited content" 
            className={`max-w-full max-h-[85vh] object-contain transition-all duration-500 ease-out ${
              isProcessing 
                ? 'opacity-50 blur-sm scale-[0.99]' 
                : 'opacity-100 animate-reveal'
            }`}
          />

          {/* Overlay Image (Original) - Shown on the RIGHT in RTL split */}
          {isModified && !isProcessing && (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                clipPath: `inset(0 0 0 ${sliderPosition}%)` // Clips from the left, revealing the right side (Original)
              }}
            >
              <img 
                src={imageState.original!} 
                alt="Original content" 
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Slider Controls */}
          {isModified && !isProcessing && (
            <>
              {/* Vertical Divider Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Handle Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-zinc-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" /></svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded border border-white/10 font-bold pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 10 ? 0 : 1 }}>
                أصلية
              </div>
              <div className="absolute top-4 left-4 z-10 bg-yellow-500/80 backdrop-blur text-white text-xs px-2 py-1 rounded border border-white/10 font-bold pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 90 ? 0 : 1 }}>
                معدلة
              </div>

              {/* Range Input for Interaction */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </>
          )}
          
          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/20 backdrop-blur-[2px] animate-fade-in">
              <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-yellow-500 font-medium tracking-widest uppercase text-sm animate-pulse">جاري المعالجة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};