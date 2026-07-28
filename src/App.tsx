import { useState, useEffect } from 'react';
import { 
  SculpturalShape, 
  MaterialParams, 
  EnvironmentType, 
  LightParams, 
  CustomPreset, 
  MaterialPreset, 
  PresetKey 
} from './types';
import { 
  DEFAULT_PARAMS, 
  MATERIAL_PRESETS, 
  STARTER_CUSTOM_PRESETS 
} from './data';
import { ThreeCanvas } from './components/ThreeCanvas';
import { PresetPanel } from './components/PresetPanel';
import { ControlPanel } from './components/ControlPanel';
import { SplitSlider } from './components/SplitSlider';
import { 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Split, 
  Maximize, 
  Sliders, 
  Layers, 
  Moon,
  Sun,
  EyeOff
} from 'lucide-react';

export default function App() {
  // Mobile responsive layout state
  const [activeTab, setActiveTab] = useState<'presets' | 'viewport' | 'deck'>('viewport');

  // Core 3D engine state
  const [shape, setShape] = useState<SculpturalShape>('torusKnot');
  const [currentParams, setCurrentParams] = useState<MaterialParams>(DEFAULT_PARAMS.glass);
  const [originalParams, setOriginalParams] = useState<MaterialParams>(DEFAULT_PARAMS.glass);
  const [basePresetKey, setBasePresetKey] = useState<PresetKey>('glass');

  // Tracking selection IDs
  const [activePresetId, setActivePresetId] = useState<string>(MATERIAL_PRESETS[0].id);
  const [activeCustomPresetId, setActiveCustomPresetId] = useState<string | null>(null);

  // Lighting & Environment
  const [environment, setEnvironment] = useState<EnvironmentType>('studio');
  const [lightParams, setLightParams] = useState<LightParams>({
    intensity: 2.2,
    color: '#ffffff',
    yaw: 45,
    pitch: 35,
    distance: 3.5,
    shadows: true,
  });

  // Compare Split View Mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [splitRatio, setSplitRatio] = useState<number>(0.5);

  // Custom presets list with LocalStorage persistence
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  // Load custom presets from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('material_lab_presets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved presets, loading starters instead.', e);
        setCustomPresets(STARTER_CUSTOM_PRESETS);
      }
    } else {
      setCustomPresets(STARTER_CUSTOM_PRESETS);
      localStorage.setItem('material_lab_presets', JSON.stringify(STARTER_CUSTOM_PRESETS));
    }

    // Set initial default preset (Vitric Obsidian)
    const initialPreset = MATERIAL_PRESETS[0];
    setCurrentParams({ ...initialPreset.params });
    setOriginalParams({ ...initialPreset.params });
    setBasePresetKey(initialPreset.key);
    setActivePresetId(initialPreset.id);
  }, []);

  // Update base preset mapping
  const handleSelectPreset = (preset: MaterialPreset) => {
    setCurrentParams({ ...preset.params });
    setOriginalParams({ ...preset.params });
    setBasePresetKey(preset.key);
    setActivePresetId(preset.id);
    setActiveCustomPresetId(null);
    // If compare mode is on, it compares modified state against the base preset we just selected!
  };

  const handleSelectCustomPreset = (customPreset: CustomPreset) => {
    setCurrentParams({ ...customPreset.params });
    // For original compare, we match the baseline defaults of that preset's category
    const baselineDefaults = DEFAULT_PARAMS[customPreset.basePreset];
    setOriginalParams({ ...baselineDefaults });
    
    setBasePresetKey(customPreset.basePreset);
    setActivePresetId('');
    setActiveCustomPresetId(customPreset.id);
  };

  const handleSaveCustomPreset = (name: string, basePreset: PresetKey) => {
    const newPreset: CustomPreset = {
      id: `custom_${Date.now()}`,
      name,
      basePreset,
      params: { ...currentParams },
      createdAt: Date.now(),
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('material_lab_presets', JSON.stringify(updated));
    setActiveCustomPresetId(newPreset.id);
    setActivePresetId('');
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('material_lab_presets', JSON.stringify(updated));
    if (activeCustomPresetId === id) {
      setActiveCustomPresetId(null);
      // Fallback to first studio preset
      handleSelectPreset(MATERIAL_PRESETS[0]);
    }
  };

  const handleResetToBaseline = () => {
    // Reset modified params to the active preset's baseline parameters
    if (activeCustomPresetId) {
      const activeCustom = customPresets.find((p) => p.id === activeCustomPresetId);
      if (activeCustom) {
        setCurrentParams({ ...activeCustom.params });
      }
    } else {
      const activeStudio = MATERIAL_PRESETS.find((p) => p.id === activePresetId);
      if (activeStudio) {
        setCurrentParams({ ...activeStudio.params });
      } else {
        setCurrentParams(DEFAULT_PARAMS[basePresetKey]);
      }
    }
  };

  const handleResetLights = () => {
    setLightParams({
      intensity: 2.2,
      color: '#ffffff',
      yaw: 45,
      pitch: 35,
      distance: 3.5,
      shadows: true,
    });
  };

  const handleUpdateParams = (newParams: Partial<MaterialParams>) => {
    setCurrentParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleUpdateLightParams = (newLights: Partial<LightParams>) => {
    setLightParams((prev) => ({ ...prev, ...newLights }));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Global Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow shadow-sky-500/20">
            <span className="font-bold text-slate-950 text-lg">M</span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-100 leading-none">
              Material Lab
            </h1>
            <span className="text-[10px] text-sky-400 font-mono tracking-wider">
              3D SHADER STUDIO
            </span>
          </div>
        </div>

        {/* Studio Action Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Compare Toggle Button */}
          <button
            id="compare-view-toggle"
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
              compareMode
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-semibold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Split className="w-4 h-4" />
            {compareMode ? 'Compare Split Active' : 'Split Comparison Screen'}
          </button>

          {/* Reset Surface Parameters */}
          <button
            id="reset-surface-btn"
            onClick={handleResetToBaseline}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset active values to original preset defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Surface
          </button>

          {/* Reset Lighting Deck */}
          <button
            id="reset-lights-btn"
            onClick={handleResetLights}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset lighting position to 45 deg studio angle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reset Lights
          </button>
        </div>

        {/* Engine Render Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded font-mono text-[10px] text-slate-400">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>60 FPS</span>
          </div>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500">
            WebGL2 RENDERER
          </span>
        </div>
      </header>

      {/* 2. Responsive Workstation Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* --- DESKTOP LEFT SIDEBAR: Presets --- */}
        <div className="hidden lg:block">
          <PresetPanel
            activePresetId={activePresetId}
            activeCustomPresetId={activeCustomPresetId}
            onSelectPreset={handleSelectPreset}
            customPresets={customPresets}
            onSelectCustomPreset={handleSelectCustomPreset}
            onSaveCustomPreset={handleSaveCustomPreset}
            onDeleteCustomPreset={handleDeleteCustomPreset}
          />
        </div>

        {/* --- MOBILE COLLAPSED PRESENTS PANEL --- */}
        {activeTab === 'presets' && (
          <div className="absolute inset-0 z-10 lg:hidden bg-slate-950">
            <PresetPanel
              activePresetId={activePresetId}
              activeCustomPresetId={activeCustomPresetId}
              onSelectPreset={handleSelectPreset}
              customPresets={customPresets}
              onSelectCustomPreset={handleSelectCustomPreset}
              onSaveCustomPreset={handleSaveCustomPreset}
              onDeleteCustomPreset={handleDeleteCustomPreset}
            />
          </div>
        )}

        {/* --- CENTRAL 3D VIEWPORT CONTAINER --- */}
        <div className={`flex-1 h-full flex flex-col relative bg-slate-950 ${activeTab === 'viewport' ? 'block' : 'hidden lg:block'}`}>
          <div id="three-viewport-box" className="flex-1 relative w-full h-full">
            <ThreeCanvas
              shape={shape}
              currentParams={currentParams}
              originalParams={originalParams}
              environment={environment}
              lightParams={lightParams}
              compareMode={compareMode}
              splitRatio={splitRatio}
            />

            {/* Interactive Split Slider Bar overlay */}
            {compareMode && (
              <SplitSlider
                splitRatio={splitRatio}
                setSplitRatio={setSplitRatio}
                containerId="three-canvas-container"
              />
            )}

            {/* Interactive overlay viewport helpers */}
            <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-800 pointer-events-none text-[11px] space-y-1 font-mono max-w-[240px]">
              <div className="text-slate-500 uppercase text-[9px] tracking-widest font-bold">ACTIVE SHADER STATS</div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Surface Profile:</span>
                <span className="text-sky-400 uppercase font-bold">{basePresetKey}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Roughness level:</span>
                <span className="text-slate-300">{currentParams.roughness.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Specular Metallics:</span>
                <span className="text-slate-300">{currentParams.metalness.toFixed(2)}</span>
              </div>
              {currentParams.transmission > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Refraction Index:</span>
                  <span className="text-slate-300">{currentParams.ior.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Help Overlay Tip */}
            <div className="absolute top-4 left-4 text-xs text-slate-400 font-mono pointer-events-none bg-slate-900/40 px-2 py-1 rounded border border-slate-800/40">
              Drag mouse on mesh to Orbit Camera
            </div>

            {/* Mobile Actions floating bar */}
            <div className="absolute top-4 right-4 flex gap-2 md:hidden">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`p-2 rounded-full backdrop-blur cursor-pointer ${
                  compareMode ? 'bg-sky-500 text-slate-950' : 'bg-slate-900/95 text-slate-400'
                }`}
                title="Toggle split view comparison"
              >
                <Split className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetToBaseline}
                className="p-2 rounded-full bg-slate-900/95 backdrop-blur text-slate-400 cursor-pointer"
                title="Reset Surface"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- DESKTOP RIGHT SIDEBAR: Parameters Deck --- */}
        <div className="hidden lg:block">
          <ControlPanel
            shape={shape}
            onChangeShape={setShape}
            params={currentParams}
            onChangeParams={handleUpdateParams}
            lightParams={lightParams}
            onChangeLightParams={handleUpdateLightParams}
            environment={environment}
            onChangeEnvironment={setEnvironment}
            basePresetKey={basePresetKey}
          />
        </div>

        {/* --- MOBILE COLLAPSED CONTROL DECK PANEL --- */}
        {activeTab === 'deck' && (
          <div className="absolute inset-0 z-10 lg:hidden bg-slate-950">
            <ControlPanel
              shape={shape}
              onChangeShape={setShape}
              params={currentParams}
              onChangeParams={handleUpdateParams}
              lightParams={lightParams}
              onChangeLightParams={handleUpdateLightParams}
              environment={environment}
              onChangeEnvironment={setEnvironment}
              basePresetKey={basePresetKey}
            />
          </div>
        )}
      </main>

      {/* 3. Mobile Navigation Tab Bar */}
      <footer className="h-14 bg-slate-900 border-t border-slate-850 flex lg:hidden z-20 shrink-0">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'presets' ? 'text-sky-400 bg-slate-850/40' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] font-medium font-sans">Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('viewport')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'viewport' ? 'text-sky-400 bg-slate-850/40' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Maximize className="w-4 h-4" />
          <span className="text-[10px] font-medium font-sans">3D Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('deck')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'deck' ? 'text-sky-400 bg-slate-850/40' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px] font-medium font-sans">Design Deck</span>
        </button>
      </footer>
    </div>
  );
}
