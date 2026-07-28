import React, { useRef, useState, useEffect } from 'react';
import { MaterialParams, LightParams, EnvironmentType, SculpturalShape, PresetKey } from '../types';
import { COLOR_SWATCHES, ENVIRONMENTS } from '../data';
import { 
  Sun, 
  Paintbrush, 
  Maximize2, 
  Lightbulb, 
  Sparkles,
  Layers,
  CircleDot
} from 'lucide-react';

interface ControlPanelProps {
  shape: SculpturalShape;
  onChangeShape: (shape: SculpturalShape) => void;
  params: MaterialParams;
  onChangeParams: (params: Partial<MaterialParams>) => void;
  lightParams: LightParams;
  onChangeLightParams: (light: Partial<LightParams>) => void;
  environment: EnvironmentType;
  onChangeEnvironment: (env: EnvironmentType) => void;
  basePresetKey: PresetKey;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  shape,
  onChangeShape,
  params,
  onChangeParams,
  lightParams,
  onChangeLightParams,
  environment,
  onChangeEnvironment,
  basePresetKey,
}) => {
  const lightPadRef = useRef<SVGSVGElement>(null);
  const [isDraggingLight, setIsDraggingLight] = useState(false);

  // Helper to map 2D Pad coords from yaw & pitch
  // Pitch 90 is center (r = 0), Pitch 10 is outer edge (r = 45).
  // Yaw is angle in degrees.
  const getPadPosition = () => {
    const center = 55;
    const maxRadius = 45;
    const r = ((90 - Math.max(10, Math.min(90, lightParams.pitch))) / 80) * maxRadius;
    const radYaw = (lightParams.yaw * Math.PI) / 180;
    
    return {
      x: center + r * Math.sin(radYaw),
      y: center - r * Math.cos(radYaw)
    };
  };

  const handleLightPadInteraction = (clientX: number, clientY: number) => {
    if (!lightPadRef.current) return;
    const rect = lightPadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const r = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2 - 8; // margins
    const clampedR = Math.min(r, maxRadius);

    // Calculate Pitch (90 at center, 10 at max outer radius)
    const pitch = 90 - (clampedR / maxRadius) * 80;

    // Calculate Yaw (-180 to 180 deg, 0 is top)
    let yaw = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (yaw < 0) yaw += 360;

    onChangeLightParams({
      yaw: Math.round(yaw),
      pitch: Math.round(pitch)
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingLight(true);
    handleLightPadInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDraggingLight(true);
    if (e.touches.length > 0) {
      handleLightPadInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLight) return;
      handleLightPadInteraction(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingLight) return;
      if (e.touches.length > 0) {
        handleLightPadInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => setIsDraggingLight(false);

    if (isDraggingLight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingLight]);

  const padPos = getPadPosition();

  return (
    <div className="w-full lg:w-96 h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shrink-0 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Paintbrush className="w-5 h-5 text-sky-400" />
        <h2 className="font-semibold text-sm tracking-wider uppercase font-sans text-slate-200">
          Design Deck
        </h2>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* 1. Geometric Shape Selector */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5 text-slate-400" /> Sculptural Canvas
          </h3>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {([
              { id: 'torusKnot', label: 'Knot', icon: '🌀' },
              { id: 'roundedCube', label: 'Ring', icon: '🍩' },
              { id: 'gem', label: 'Gem', icon: '💎' },
              { id: 'sphere', label: 'Orb', icon: '🌕' },
            ] as const).map((item) => (
              <button
                key={item.id}
                id={`shape-btn-${item.id}`}
                onClick={() => onChangeShape(item.id)}
                className={`py-2 rounded flex flex-col items-center gap-1 text-[11px] transition-all cursor-pointer ${
                  shape === item.id
                    ? 'bg-slate-800 text-sky-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Color Selection */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3">
            Surface Color
          </h3>
          <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
            {/* Color Swatch Grid */}
            <div className="grid grid-cols-9 gap-1.5">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  id={`color-swatch-${color.replace('#', '')}`}
                  onClick={() => onChangeParams({ color })}
                  style={{ backgroundColor: color }}
                  className={`aspect-square rounded-md border cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                    params.color.toLowerCase() === color.toLowerCase()
                      ? 'border-white ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900 scale-105'
                      : 'border-slate-800'
                  }`}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="hex-color-text-input"
                  type="text"
                  value={params.color.toUpperCase()}
                  onChange={(e) => {
                    if (e.target.value.startsWith('#') && e.target.value.length <= 7) {
                      onChangeParams({ color: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden shrink-0 cursor-pointer">
                <input
                  id="raw-color-picker"
                  type="color"
                  value={params.color}
                  onChange={(e) => onChangeParams({ color: e.target.value })}
                  className="absolute inset-0 w-full h-full scale-150 cursor-pointer border-0 p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Surface Physics Sliders */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" /> Physics Deck
          </h3>
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            {/* Roughness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Roughness</span>
                <span className="font-mono text-slate-400">{params.roughness.toFixed(2)}</span>
              </div>
              <input
                id="roughness-slider"
                type="range"
                min="0.00"
                max="1.00"
                step="0.01"
                value={params.roughness}
                onChange={(e) => onChangeParams({ roughness: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Polished</span>
                <span>Matte</span>
              </div>
            </div>

            {/* Metallic */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Metallic Level</span>
                <span className="font-mono text-slate-400">{params.metalness.toFixed(2)}</span>
              </div>
              <input
                id="metalness-slider"
                type="range"
                min="0.00"
                max="1.00"
                step="0.01"
                value={params.metalness}
                onChange={(e) => onChangeParams({ metalness: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Dielectric (Plastic/Clay)</span>
                <span>Metal</span>
              </div>
            </div>

            {/* Clearcoat (Glaze) */}
            <div className={basePresetKey === 'ceramic' ? 'border-l-2 border-amber-500/50 pl-3' : ''}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  Clearcoat / Glaze
                  {basePresetKey === 'ceramic' && <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded uppercase">Glazed</span>}
                </span>
                <span className="font-mono text-slate-400">{params.clearcoat.toFixed(2)}</span>
              </div>
              <input
                id="clearcoat-slider"
                type="range"
                min="0.00"
                max="1.00"
                step="0.01"
                value={params.clearcoat}
                onChange={(e) => onChangeParams({ clearcoat: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Sheen (Fabric overlay) */}
            <div className={basePresetKey === 'fabric' ? 'border-l-2 border-rose-500/50 pl-3' : ''}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  Sheen Intensity
                  {basePresetKey === 'fabric' && <span className="text-[9px] bg-rose-500/20 text-rose-300 font-mono px-1 rounded uppercase">Velvet</span>}
                </span>
                <span className="font-mono text-slate-400">{params.sheen.toFixed(2)}</span>
              </div>
              <input
                id="sheen-slider"
                type="range"
                min="0.00"
                max="1.00"
                step="0.01"
                value={params.sheen}
                onChange={(e) => onChangeParams({ sheen: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              {params.sheen > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Sheen Hue:</span>
                  <input
                    type="color"
                    value={params.sheenColor}
                    onChange={(e) => onChangeParams({ sheenColor: e.target.value })}
                    className="w-5 h-5 bg-transparent border-0 rounded p-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{params.sheenColor}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Translucency Section (Glass features) */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" /> Translucency (Glass)
          </h3>
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            {/* Transmission */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Transmission (Opaqueness)</span>
                <span className="font-mono text-slate-400">{(params.transmission * 100).toFixed(0)}%</span>
              </div>
              <input
                id="transmission-slider"
                type="range"
                min="0.00"
                max="1.00"
                step="0.01"
                value={params.transmission}
                onChange={(e) => onChangeParams({ transmission: parseFloat(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Opaque Solid</span>
                <span>Clear Glass</span>
              </div>
            </div>

            {/* Refractive Index */}
            {params.transmission > 0.05 && (
              <div className="space-y-4 animate-fade-in">
                {/* Index of Refraction */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Refraction Index (IOR)</span>
                    <span className="font-mono text-slate-400">{params.ior.toFixed(2)}</span>
                  </div>
                  <input
                    id="ior-slider"
                    type="range"
                    min="1.00"
                    max="2.33"
                    step="0.01"
                    value={params.ior}
                    onChange={(e) => onChangeParams({ ior: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1.0 (Air)</span>
                    <span>1.5 (Glass)</span>
                    <span>2.4 (Diamond)</span>
                  </div>
                </div>

                {/* Thickness */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Reflective Thickness</span>
                    <span className="font-mono text-slate-400">{params.thickness.toFixed(1)} mm</span>
                  </div>
                  <input
                    id="thickness-slider"
                    type="range"
                    min="0.0"
                    max="5.0"
                    step="0.1"
                    value={params.thickness}
                    onChange={(e) => onChangeParams({ thickness: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Bump Pattern Section */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Pattern Bump relief
          </h3>
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                Micro Relief Structure
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded border border-slate-800">
                {([
                  { id: 'none', label: 'Plain' },
                  { id: 'weave', label: 'Weave' },
                  { id: 'dots', label: 'Dots' },
                  { id: 'noise', label: 'Noise' },
                ] as const).map((item) => (
                  <button
                    key={item.id}
                    id={`bump-btn-${item.id}`}
                    onClick={() => onChangeParams({ bumpType: item.id })}
                    className={`py-1.5 text-center rounded text-[11px] font-medium transition-all cursor-pointer ${
                      params.bumpType === item.id
                        ? 'bg-slate-800 text-sky-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {params.bumpType !== 'none' && (
              <div className="space-y-4 animate-fade-in">
                {/* Bump Frequency (Pattern Scale) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Pattern Density</span>
                    <span className="font-mono text-slate-400">{params.bumpFrequency}</span>
                  </div>
                  <input
                    id="bump-frequency-slider"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={params.bumpFrequency}
                    onChange={(e) => onChangeParams({ bumpFrequency: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Large Coarse</span>
                    <span>Micro Fine</span>
                  </div>
                </div>

                {/* Bump Scale (Relief Depth) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Relief Depth</span>
                    <span className="font-mono text-slate-400">{params.bumpScale.toFixed(3)}</span>
                  </div>
                  <input
                    id="bump-scale-slider"
                    type="range"
                    min="0.001"
                    max="0.150"
                    step="0.001"
                    value={params.bumpScale}
                    onChange={(e) => onChangeParams({ bumpScale: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Environment Preset Selector */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3">
            Studio Backdrop Environment
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env.id}
                id={`env-btn-${env.id}`}
                onClick={() => onChangeEnvironment(env.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  environment === env.id
                    ? 'bg-slate-800 border-sky-500'
                    : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/50 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {env.id === 'studio' ? '🏢' : env.id === 'sunset' ? '🌅' : '🌆'}
                  </span>
                  <div>
                    <span className="font-medium text-xs text-slate-200 block leading-tight">
                      {env.name}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal block line-clamp-1">
                      {env.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 7. Advanced Interactive Lighting Deck */}
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Interactive Light Deck
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            {/* SVG Direction Trackpad */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-400 mb-2 block text-center uppercase tracking-wider">
                Light Sphere Joyspad
              </span>
              <div className="relative">
                <svg
                  ref={lightPadRef}
                  width="110"
                  height="110"
                  className="bg-slate-950 rounded-full border border-slate-800 cursor-crosshair select-none overflow-visible shadow-inner"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  {/* Grid Lines */}
                  <circle cx="55" cy="55" r="45" fill="none" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="55" cy="55" r="22.5" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="10" y1="55" x2="100" y2="55" stroke="#1e293b" strokeWidth="1" />
                  <line x1="55" y1="10" x2="55" y2="100" stroke="#1e293b" strokeWidth="1" />

                  {/* Dynamic Pointer Representation */}
                  <g transform={`translate(${padPos.x}, ${padPos.y})`}>
                    <circle r="8" fill="rgba(14, 165, 233, 0.25)" className="animate-ping" />
                    <circle r="5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" className="shadow" />
                  </g>
                </svg>

                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-600">N (0°)</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-600">S (180°)</div>
              </div>
              <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
                Yaw: {lightParams.yaw}° | Pitch: {lightParams.pitch}°
              </div>
            </div>

            {/* Light Sliders */}
            <div className="space-y-4 flex flex-col justify-center">
              {/* Key Light Intensity */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Key Intensity</span>
                  <span className="font-mono text-slate-300">{lightParams.intensity.toFixed(1)}x</span>
                </div>
                <input
                  id="light-intensity-slider"
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={lightParams.intensity}
                  onChange={(e) => onChangeLightParams({ intensity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Light Color Swatches */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Light Tint Color</span>
                <div className="flex gap-1.5">
                  {[
                    { color: '#ffffff', name: 'Neutral' },
                    { color: '#fed7aa', name: 'Sunset Warm' },
                    { color: '#bfdbfe', name: 'Studio Cool' },
                    { color: '#ffd6e8', name: 'Rose Dream' },
                  ].map((tint) => (
                    <button
                      key={tint.color}
                      id={`light-tint-${tint.color.replace('#', '')}`}
                      onClick={() => onChangeLightParams({ color: tint.color })}
                      style={{ backgroundColor: tint.color }}
                      className={`w-6 h-6 rounded border cursor-pointer ${
                        lightParams.color.toLowerCase() === tint.color.toLowerCase()
                          ? 'border-sky-500 ring-1 ring-sky-500 scale-105'
                          : 'border-slate-800'
                      }`}
                      title={tint.name}
                    />
                  ))}
                </div>
              </div>

              {/* Toggle Shadows */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                <span className="text-[11px] text-slate-400">Render Soft Shadows</span>
                <button
                  id="toggle-shadows-btn"
                  onClick={() => onChangeLightParams({ shadows: !lightParams.shadows })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    lightParams.shadows ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${
                    lightParams.shadows ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
