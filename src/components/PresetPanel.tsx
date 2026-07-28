import React, { useState } from 'react';
import { MaterialPreset, CustomPreset, PresetKey } from '../types';
import { MATERIAL_PRESETS, DEFAULT_PARAMS } from '../data';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Compass, 
  Layers, 
  BookmarkCheck, 
  Info,
  Sliders
} from 'lucide-react';

interface PresetPanelProps {
  activePresetId: string;
  activeCustomPresetId: string | null;
  onSelectPreset: (preset: MaterialPreset) => void;
  customPresets: CustomPreset[];
  onSelectCustomPreset: (preset: CustomPreset) => void;
  onSaveCustomPreset: (name: string, basePreset: PresetKey) => void;
  onDeleteCustomPreset: (id: string) => void;
}

export const PresetPanel: React.FC<PresetPanelProps> = ({
  activePresetId,
  activeCustomPresetId,
  onSelectPreset,
  customPresets,
  onSelectCustomPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetBase, setNewPresetBase] = useState<PresetKey>('glass');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSubmitSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveCustomPreset(newPresetName.trim(), newPresetBase);
    setNewPresetName('');
    setShowSaveForm(false);
  };

  const getPresetIcon = (key: PresetKey) => {
    switch (key) {
      case 'glass':
        return '🔮';
      case 'metal':
        return '🔩';
      case 'ceramic':
        return '🏺';
      case 'fabric':
        return '🧶';
    }
  };

  return (
    <div className="w-full lg:w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 shrink-0 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="font-semibold text-sm tracking-wider uppercase font-sans text-slate-200">
            Material Library
          </h2>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
          {MATERIAL_PRESETS.length + customPresets.length} items
        </span>
      </div>

      {/* Main Presets Section */}
      <div className="p-4 flex-1 space-y-6">
        <div>
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Studio Presets
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {MATERIAL_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id && !activeCustomPresetId;
              return (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => onSelectPreset(preset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex flex-col gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 border-sky-500 shadow-sm shadow-sky-500/10'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-slate-200 flex items-center gap-1.5">
                      <span className="text-base">{getPresetIcon(preset.key)}</span>
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {preset.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Presets Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-sky-400" /> Custom Presets
            </h3>
            {!showSaveForm && (
              <button
                id="add-preset-toggle"
                onClick={() => setShowSaveForm(true)}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 bg-sky-950/30 px-2 py-1 rounded border border-sky-900/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Save State
              </button>
            )}
          </div>

          {/* New Preset Creation Form */}
          {showSaveForm && (
            <form
              onSubmit={handleSubmitSave}
              className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 mb-3 space-y-3 animate-fade-in"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">New Custom Material</span>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Preset Name
                </label>
                <input
                  id="custom-preset-name-input"
                  type="text"
                  required
                  placeholder="e.g. My Emerald Silk"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Base Material Type
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['glass', 'metal', 'ceramic', 'fabric'] as PresetKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewPresetBase(key)}
                      className={`py-1 text-center rounded text-xs capitalize border cursor-pointer ${
                        newPresetBase === key
                          ? 'bg-sky-950 border-sky-500 text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="submit-save-preset"
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Save current values
              </button>
            </form>
          )}

          {/* List of Custom Presets */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
            {customPresets.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                No custom presets saved. Save your customized values to see them here!
              </div>
            ) : (
              customPresets.map((preset) => {
                const isActive = activeCustomPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`group w-full rounded-md border transition-all duration-200 flex items-center justify-between p-2.5 ${
                      isActive
                        ? 'bg-slate-800/80 border-sky-500 shadow-sm shadow-sky-500/5'
                        : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => onSelectCustomPreset(preset)}
                      className="flex-1 text-left flex flex-col gap-0.5 cursor-pointer"
                    >
                      <span className="font-medium text-xs text-slate-200 flex items-center gap-1.5">
                        <span className="text-sm">{getPresetIcon(preset.basePreset)}</span>
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Saved {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteCustomPreset(preset.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-all cursor-pointer"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Help and Studio Stats Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3 text-xs text-slate-400">
        <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" /> Viewport Navigation
        </h4>
        <ul className="space-y-1.5 text-[11px] font-mono text-slate-400">
          <li className="flex justify-between">
            <span>Orbit Camera</span>
            <span className="text-slate-500">Drag Left Mouse</span>
          </li>
          <li className="flex justify-between">
            <span>Pan Scene</span>
            <span className="text-slate-500">Drag Right Mouse / Shift</span>
          </li>
          <li className="flex justify-between">
            <span>Zoom</span>
            <span className="text-slate-500">Scroll Wheel</span>
          </li>
          <li className="flex justify-between">
            <span>Drag Key Light</span>
            <span className="text-sky-400">Right Controller Pad</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
