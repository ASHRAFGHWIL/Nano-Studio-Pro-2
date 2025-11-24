import React, { useState, useCallback } from 'react';
import { StudioControls } from './components/StudioControls';
import { PreviewArea } from './components/PreviewArea';
import { ImageState, StudioStatus } from './types';
import { editImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    current: null,
    history: [],
    historyIndex: 0,
    mimeType: ''
  });
  
  const [status, setStatus] = useState<StudioStatus>(StudioStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setStatus(StudioStatus.UPLOADING);
    setErrorMsg(null);

    // Validate MIME type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("صيغة الملف غير مدعومة. يرجى استخدام PNG, JPG, أو WEBP.");
      setStatus(StudioStatus.ERROR);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageState({
        original: result,
        current: result,
        history: [result],
        historyIndex: 0,
        mimeType: file.type
      });
      setStatus(StudioStatus.IDLE);
    };
    
    reader.onerror = () => {
      setErrorMsg("فشل قراءة الملف");
      setStatus(StudioStatus.ERROR);
    };

    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!imageState.current) return;

    setStatus(StudioStatus.PROCESSING);
    setErrorMsg(null);

    try {
      // Use the *current* image as the base for the edit, allowing iterative edits.
      const result = await editImageWithGemini(
        imageState.current, 
        imageState.mimeType, 
        prompt
      );
      
      const fullBase64 = `data:${result.mimeType};base64,${result.data}`;

      setImageState(prev => {
        // Truncate history if we've undone something before generating a new image
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(fullBase64);

        return {
          ...prev,
          current: fullBase64,
          history: newHistory,
          historyIndex: newHistory.length - 1, // Point to the new image
          mimeType: result.mimeType
        };
      });
      
      setStatus(StudioStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ ما أثناء الإنشاء.");
      setStatus(StudioStatus.ERROR);
    }
  }, [imageState.current, imageState.mimeType, imageState.historyIndex]);

  const handleReset = () => {
    setImageState({
      original: null,
      current: null,
      history: [],
      historyIndex: 0,
      mimeType: ''
    });
    setStatus(StudioStatus.IDLE);
    setErrorMsg(null);
  };
  
  const handleUndo = () => {
    if (imageState.historyIndex > 0) {
        const newIndex = imageState.historyIndex - 1;
        setImageState(prev => ({
            ...prev,
            historyIndex: newIndex,
            current: prev.history[newIndex]
        }));
    }
  };

  const handleRedo = () => {
      if (imageState.historyIndex < imageState.history.length - 1) {
          const newIndex = imageState.historyIndex + 1;
          setImageState(prev => ({
              ...prev,
              historyIndex: newIndex,
              current: prev.history[newIndex]
          }));
      }
  };

  const canUndo = imageState.historyIndex > 0;
  const canRedo = imageState.historyIndex < imageState.history.length - 1;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-zinc-950 text-white overflow-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
        <h1 className="serif text-xl font-bold">نانو ستوديو</h1>
        {status === StudioStatus.PROCESSING && <span className="text-xs text-yellow-500 animate-pulse">جاري المعالجة</span>}
      </div>

      {/* Main Content Area (Preview) - Order 2 on mobile, Order 2 on Desktop */}
      <main className="flex-1 h-full relative order-2 lg:order-2 flex flex-col">
        {/* Error Notification */}
        {errorMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-red-400/20 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="mr-2 hover:text-red-200">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}

        <PreviewArea 
          imageState={imageState} 
          onImageUpload={handleImageUpload}
          isProcessing={status === StudioStatus.PROCESSING}
        />
      </main>

      {/* Sidebar Controls - Order 3 on mobile (bottom), Order 1 on Desktop (Right in RTL) */}
      <aside className="order-3 lg:order-1 lg:h-full lg:w-96 shrink-0 z-20 shadow-2xl shadow-black">
        <StudioControls 
          onGenerate={handleGenerate}
          onReset={handleReset}
          isProcessing={status === StudioStatus.PROCESSING}
          hasImage={!!imageState.current}
          currentImage={imageState.current}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </aside>

    </div>
  );
};

export default App;