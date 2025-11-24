import React, { useState } from 'react';
import { Button } from './Button';
import { Preset } from '../types';
import { downloadImage } from '../utils/imageUtils';

interface StudioControlsProps {
  onGenerate: (prompt: string) => void;
  onReset: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  currentImage: string | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PRESETS: Preset[] = [
  { id: 'cinematic', name: 'إضاءة سينمائية', prompt: 'Add cinematic studio lighting, dramatic contrast, professional product photography style', icon: '🎬' },
  { id: 'softbox', name: 'سوفت بوكس ناعم', prompt: 'Place on a clean white background with softbox lighting, highly detailed, commercial look', icon: '💡' },
  { id: 'cyberpunk', name: 'نيون/سايبر بانك', prompt: 'Add neon lights, cyberpunk aesthetic, pink and blue rim lighting', icon: '🌃' },
  { id: 'nature', name: 'مشهد طبيعي', prompt: 'Place the object on a mossy rock in a forest, dappled sunlight, bokeh background', icon: '🌿' },
  { id: 'luxury', name: 'فخامة ذهبية', prompt: 'Add gold accents, luxurious marble background, warm ambient lighting', icon: '✨' },
  { id: 'industrial', name: 'صناعي خام', prompt: 'Place object on raw concrete surface, brutalist architecture, industrial lighting, sharp shadows', icon: '🏗️' },
  { id: 'pastel', name: 'ألوان باستيل', prompt: 'Change the background to a soft pastel color palette with minimal geometric shapes, in a pop art style', icon: '🎨' },
  { id: 'golden', name: 'غروب دافئ', prompt: 'Golden hour sunlight, warm glow, long soft shadows, outdoor natural atmosphere, lens flare', icon: '🌅' },
  { id: 'monochrome', name: 'أبيض وأسود', prompt: 'High contrast black and white photography, dramatic noir lighting, sharp details, artistic composition', icon: '🎱' },
  { id: 'kitchen', name: 'مطبخ عصري', prompt: 'Place on a clean marble kitchen counter, bright morning light, blurred modern kitchen background, lifestyle', icon: '🍳' },
  { id: 'minimalist', name: 'مينيمالي نظيف', prompt: 'Place on a white pedestal, minimalist geometric background, high key lighting, soft shadows, architectural style', icon: '🏛️' },
  { id: 'vintage', name: 'ريترو كلاسيك', prompt: 'Add 70s retro film look, warm faded colors, vintage furniture background, nostalgic atmosphere, grain texture', icon: '🎞️' },
  { id: 'tech', name: 'تقني حديث', prompt: 'Place on a clean white glossy surface, cool white laboratory lighting, high-tech environment, sleek modern look', icon: '🧪' },
  { id: 'summer', name: 'أجواء صيفية', prompt: 'Place on sand, bright sunlight, blue sky background, beach atmosphere, refreshing look, hard shadows', icon: '🏖️' },
  { id: 'darkmode', name: 'دارك مود', prompt: 'Place on a matte black surface, dark grey background, sleek dim lighting, modern tech aesthetic', icon: '🌑' },
];

const CAMERA_MOVES = [
  { id: 'dolly_in', name: 'تقريب (Dolly In)', prompt: 'Zoom in slightly on the subject, maintaining high detail and lighting', icon: '🔍+' },
  { id: 'dolly_out', name: 'تبعيد (Dolly Out)', prompt: 'Zoom out slightly to reveal more surroundings, maintaining consistency', icon: '🔍-' },
  { id: 'low_angle', name: 'زاوية منخفضة', prompt: 'Change to a low camera angle looking up at the subject, dramatic view', icon: '📐' },
  { id: 'high_angle', name: 'زاوية مرتفعة', prompt: 'Change to a high camera angle looking down at the subject, overview', icon: '📏' },
  { id: 'dutch', name: 'إمالة (Dutch)', prompt: 'Add a dutch angle tilt for a dynamic, energetic look', icon: '🔄' },
];

const SOLID_COLORS = [
  { name: 'White', hex: '#FFFFFF', prompt: 'Change background to pure white' },
  { name: 'Black', hex: '#000000', prompt: 'Change background to pure black' },
  { name: 'Gray', hex: '#808080', prompt: 'Change background to neutral gray' },
  { name: 'Red', hex: '#EF4444', prompt: 'Change background to vibrant red' },
  { name: 'Blue', hex: '#3B82F6', prompt: 'Change background to professional blue' },
  { name: 'Green', hex: '#10B981', prompt: 'Change background to green screen style' },
];

const GRADIENTS = [
  { name: 'Warm', class: 'from-orange-400 to-red-500', prompt: 'Change background to a warm orange to red gradient' },
  { name: 'Cool', class: 'from-blue-400 to-cyan-500', prompt: 'Change background to a cool blue to cyan gradient' },
  { name: 'Luxury', class: 'from-slate-900 to-slate-700', prompt: 'Change background to a luxury dark gradient' },
];

const SCENES = [
  { id: 'studio', name: 'ستوديو أبيض', prompt: 'Place object on a white infinity curve studio background with soft shadows' },
  { id: 'desk', name: 'مكتب خشبي', prompt: 'Place object on a clean wooden desk with a blurred office background' },
  { id: 'marble', name: 'رخام فاخر', prompt: 'Place object on a luxury white marble surface with reflections' },
  { id: 'nature', name: 'طبيعة ضبابية', prompt: 'Place object in a misty forest floor with shallow depth of field' },
];

const VISUAL_EFFECTS = [
  { id: 'vignette', name: 'تظليل الحواف', prompt: 'Add a subtle, dark vignette effect around the edges for focus', icon: '🎯' },
  { id: 'grain', name: 'حبيبات فيلم', prompt: 'Add a light, fine film grain texture for a vintage feel', icon: '🎞️' },
  { id: 'flare', name: 'توهج عدسة', prompt: 'Add a warm-toned cinematic anamorphic lens flare originating from the side of the image', icon: '🌟' },
  { id: 'color_grade', name: 'تدرج لوني سينمائي', prompt: 'Apply cinematic color grading with a slight cool tone and increased contrast.', icon: '🎥' },
];


export const StudioControls: React.FC<StudioControlsProps> = ({ 
  onGenerate, 
  onReset, 
  isProcessing,
  hasImage,
  currentImage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [prompt, setPrompt] = useState('');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportScale, setExportScale] = useState<number>(1);
  const [bokehLevel, setBokehLevel] = useState(10);
  const [textureLevel, setTextureLevel] = useState(10);
  
  // State for dropdowns to act as controlled inputs (resettable)
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedScene, setSelectedScene] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handlePromptSet = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'preset' | 'camera' | 'scene') => {
    const value = e.target.value;
    if (!value) return;

    handlePromptSet(value);
    
    if (type === 'preset') setSelectedPreset(value);
    if (type === 'camera') setSelectedCamera(value);
    if (type === 'scene') setSelectedScene(value);
  };

  const handleDownload = () => {
    if (currentImage) {
      const filename = `nano-studio-${new Date().toISOString().slice(0,10)}`;
      downloadImage(currentImage, filename, exportFormat, exportScale);
    }
  };

  const getBokehPrompt = (level: number): string | null => {
    if (level === 0) return 'Remove any background blur (bokeh effect).';
    if (level <= 25) return `Add a very subtle background blur (light bokeh at ${level}%) to slightly separate the subject.`;
    if (level <= 50) return `Add a moderate background blur (medium bokeh at ${level}%) for a professional look.`;
    if (level <= 75) return `Increase the background blur significantly (strong bokeh at ${level}%) to make the subject pop.`;
    return `Add an extreme and creamy background blur (very strong bokeh at ${level}%), simulating a wide aperture lens for maximum subject isolation.`;
  };

  const handleBokehChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setBokehLevel(Number(e.target.value));
  };

  const handleBokehApply = () => {
      const bokehPrompt = getBokehPrompt(bokehLevel);
      if (bokehPrompt) {
          onGenerate(bokehPrompt);
      }
  };

  const getTexturePrompt = (level: number): string | null => {
    if (level === 0) return 'Slightly soften the product details and textures for a smoother appearance.';
    if (level <= 25) return `Subtly enhance the product's texture and micro-contrast details to make it look more refined. Apply an effect intensity of ${level}%.`;
    if (level <= 50) return `Enhance the product's texture details and sharpness for a more defined, professional look. Apply an effect intensity of ${level}%.`;
    if (level <= 75) return `Strongly enhance the texture details on the product, making its surfaces appear more tactile and refined. Apply an effect intensity of ${level}%.`;
    return `Maximally enhance the texture and fine details on the product for an ultra-sharp, high-definition look, making the product appear extremely refined. Apply an effect intensity of ${level}%.`;
  };

  const handleTextureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextureLevel(Number(e.target.value));
  };

  const handleTextureApply = () => {
      const texturePrompt = getTexturePrompt(textureLevel);
      if (texturePrompt) {
          onGenerate(texturePrompt);
      }
  };


  // Helper styles for Select
  const selectClass = "w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Custom Chevron Icon for Select
  const ChevronIcon = () => (
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
      <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-full lg:w-96 p-6 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="serif text-2xl font-bold text-white mb-1">نانو ستوديو</h2>
        <p className="text-zinc-500 text-sm">مدعوم بواسطة Gemini 2.5</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
            المخرج الذكي
          </label>
          <textarea
            id="prompt"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[100px] resize-none text-sm leading-relaxed"
            placeholder="صِف رؤيتك... مثال: 'أضف فلتر ريترو' أو 'ضع المنتج على طاولة خشبية'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!hasImage || isProcessing}
            dir="rtl"
          />
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={!hasImage || !prompt.trim() || isProcessing}
          isLoading={isProcessing}
          className="w-full h-12 text-lg"
        >
          {isProcessing ? 'جاري المعالجة...' : 'إنشاء اللقطة'}
        </Button>

        <hr className="border-zinc-800" />

        {/* Camera Moves Dropdown */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">
            حركة الكاميرا
          </label>
          <div className="relative">
            <select
              value={selectedCamera}
              onChange={(e) => handleDropdownChange(e, 'camera')}
              disabled={!hasImage || isProcessing}
              className={selectClass}
              dir="rtl"
            >
              <option value="">اختر حركة للكاميرا...</option>
              {CAMERA_MOVES.map((move) => (
                <option key={move.id} value={move.prompt}>
                  {move.icon} {move.name}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        {/* Presets Dropdown */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">
            أنماط جاهزة
          </label>
          <div className="relative">
            <select
              value={selectedPreset}
              onChange={(e) => handleDropdownChange(e, 'preset')}
              disabled={!hasImage || isProcessing}
              className={selectClass}
              dir="rtl"
            >
              <option value="">اختر نمطاً جاهزاً...</option>
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.prompt}>
                  {preset.icon} {preset.name}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        {/* Backgrounds Section */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            تغيير الخلفية
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 justify-end">
            {SOLID_COLORS.map(c => (
              <button 
                key={c.name}
                onClick={() => handlePromptSet(c.prompt)}
                disabled={!hasImage || isProcessing}
                className="w-6 h-6 rounded-full border border-zinc-700 hover:scale-125 transition-transform focus:ring-2 ring-yellow-500/50 disabled:opacity-50"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            {GRADIENTS.map(g => (
              <button 
                key={g.name}
                onClick={() => handlePromptSet(g.prompt)}
                disabled={!hasImage || isProcessing}
                className={`w-6 h-6 rounded-full border border-zinc-700 bg-gradient-to-br ${g.class} hover:scale-125 transition-transform focus:ring-2 ring-yellow-500/50 disabled:opacity-50`}
                title={g.name}
              />
            ))}
          </div>

          <div className="relative">
            <select
              value={selectedScene}
              onChange={(e) => handleDropdownChange(e, 'scene')}
              disabled={!hasImage || isProcessing}
              className={selectClass}
              dir="rtl"
            >
              <option value="">اختر مشهداً...</option>
              {SCENES.map((scene) => (
                <option key={scene.id} value={scene.prompt}>
                  🏞️ {scene.name}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <hr className="border-zinc-800" />
        
        {/* Visual Effects Section */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            تأثيرات بصرية
          </label>
          <div className="flex flex-wrap gap-2">
            {VISUAL_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handlePromptSet(effect.prompt)}
                disabled={!hasImage || isProcessing}
                className="flex-grow text-xs text-center p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700/50 flex items-center justify-center gap-1.5"
                title={effect.name}
              >
                <span>{effect.icon}</span>
                <span>{effect.name}</span>
              </button>
            ))}
          </div>

          {/* Texture Detail Slider */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <label htmlFor="texture-slider" className="flex justify-between items-center text-sm font-medium text-zinc-300 mb-2">
              <span>🔪 تحسين التفاصيل</span>
              <span className={`px-2 py-0.5 rounded-md text-zinc-900 text-xs font-bold ${textureLevel > 0 ? 'bg-yellow-400' : 'bg-zinc-600'}`}>
                {textureLevel > 0 ? `${textureLevel}%` : 'إيقاف'}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="texture-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={textureLevel}
                onChange={handleTextureChange}
                disabled={!hasImage || isProcessing}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all disabled:opacity-50 disabled:[&::-webkit-slider-thumb]:bg-zinc-600"
                style={{ direction: 'ltr' }}
              />
               <Button 
                variant="secondary" 
                onClick={handleTextureApply} 
                disabled={!hasImage || isProcessing}
                className="px-4 py-2 text-xs h-9 shrink-0"
              >
                تطبيق
              </Button>
            </div>
          </div>

          {/* Bokeh Slider */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <label htmlFor="bokeh-slider" className="flex justify-between items-center text-sm font-medium text-zinc-300 mb-2">
              <span>✨ ضبابية الخلفية (Bokeh)</span>
              <span className={`px-2 py-0.5 rounded-md text-zinc-900 text-xs font-bold ${bokehLevel > 0 ? 'bg-yellow-400' : 'bg-zinc-600'}`}>
                {bokehLevel > 0 ? `${bokehLevel}%` : 'إيقاف'}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="bokeh-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={bokehLevel}
                onChange={handleBokehChange}
                disabled={!hasImage || isProcessing}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all disabled:opacity-50 disabled:[&::-webkit-slider-thumb]:bg-zinc-600"
                style={{ direction: 'ltr' }}
              />
               <Button 
                variant="secondary" 
                onClick={handleBokehApply} 
                disabled={!hasImage || isProcessing}
                className="px-4 py-2 text-xs h-9 shrink-0"
              >
                تطبيق
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Export Controls */}
      {hasImage && (
        <div className="mt-8 pt-6 border-t border-zinc-800">
           <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            تصدير ومشاركة
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Format Selection */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
               <button 
                 onClick={() => setExportFormat('png')}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportFormat === 'png' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 PNG
               </button>
               <button 
                 onClick={() => setExportFormat('jpeg')}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportFormat === 'jpeg' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 JPG
               </button>
               <button 
                 onClick={() => setExportFormat('webp')}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportFormat === 'webp' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 WEBP
               </button>
            </div>

            {/* Scale Selection */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
               <button 
                 onClick={() => setExportScale(1)}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportScale === 1 ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 أصلية
               </button>
               <button 
                 onClick={() => setExportScale(0.75)}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportScale === 0.75 ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 75%
               </button>
               <button 
                 onClick={() => setExportScale(0.5)}
                 className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${exportScale === 0.5 ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 50%
               </button>
            </div>
          </div>

          <Button 
            variant="secondary" 
            onClick={handleDownload} 
            className="w-full text-sm h-10 border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            حفظ الصورة
          </Button>
        </div>
      )}

      {/* Footer Controls */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
            <Button 
                variant="ghost" 
                onClick={onUndo} 
                disabled={!canUndo || isProcessing}
                className="w-full text-sm"
                title="تراجع"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10h-1" /></svg>
                تراجع
            </Button>
            <Button 
                variant="ghost" 
                onClick={onRedo} 
                disabled={!canRedo || isProcessing}
                className="w-full text-sm"
                title="إعادة"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 000 10h1" /></svg>
                إعادة
            </Button>
        </div>
        <Button 
          variant="ghost" 
          onClick={onReset} 
          disabled={!hasImage || isProcessing}
          className="w-full text-sm hover:text-red-400"
        >
          بدء جلسة جديدة
        </Button>
      </div>
    </div>
  );
};