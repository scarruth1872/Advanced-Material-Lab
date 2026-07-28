import { MaterialPreset, EnvironmentPreset, MaterialParams, CustomPreset } from './types';

export const DEFAULT_PARAMS: Record<string, MaterialParams> = {
  glass: {
    color: '#e2f0fd',
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.95,
    ior: 1.52,
    thickness: 2.5,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    sheen: 0.0,
    sheenColor: '#ffffff',
    bumpScale: 0.01,
    bumpType: 'none',
    bumpFrequency: 20,
  },
  metal: {
    color: '#e2e8f0',
    roughness: 0.18,
    metalness: 1.0,
    transmission: 0.0,
    ior: 1.5,
    thickness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    sheen: 0.0,
    sheenColor: '#ffffff',
    bumpScale: 0.01,
    bumpType: 'none',
    bumpFrequency: 20,
  },
  ceramic: {
    color: '#faeed1',
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.0,
    ior: 1.5,
    thickness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    sheen: 0.1,
    sheenColor: '#ffffff',
    bumpScale: 0.01,
    bumpType: 'none',
    bumpFrequency: 20,
  },
  fabric: {
    color: '#e11d48',
    roughness: 0.8,
    metalness: 0.0,
    transmission: 0.0,
    ior: 1.1,
    thickness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    sheen: 0.9,
    sheenColor: '#fda4af',
    bumpScale: 0.04,
    bumpType: 'weave',
    bumpFrequency: 45,
  },
};

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'p1',
    name: 'Vitric Obsidian',
    key: 'glass',
    params: {
      ...DEFAULT_PARAMS.glass,
      color: '#1e1b4b', // Dark indigo tint
      roughness: 0.02,
      transmission: 0.92,
      thickness: 3.0,
    },
    description: 'High-density silica glass with a translucent dark indigo tint and glossy reflections.',
  },
  {
    id: 'p2',
    name: 'Liquid Amber',
    key: 'glass',
    params: {
      ...DEFAULT_PARAMS.glass,
      color: '#f59e0b', // Amber/orange
      roughness: 0.08,
      transmission: 0.88,
      thickness: 2.0,
      ior: 1.45,
    },
    description: 'Warm translucent resin casting that catches internal light scatter beautifully.',
  },
  {
    id: 'p3',
    name: 'Satin Brass',
    key: 'metal',
    params: {
      ...DEFAULT_PARAMS.metal,
      color: '#eab308', // Gold/Brass
      roughness: 0.25,
      metalness: 1.0,
    },
    description: 'Finely-brushed warm gold alloy with soft specular highlights and rich metallic weight.',
  },
  {
    id: 'p4',
    name: 'Polished Chrome',
    key: 'metal',
    params: {
      ...DEFAULT_PARAMS.metal,
      color: '#f8fafc',
      roughness: 0.02,
      metalness: 1.0,
    },
    description: 'Near-perfect mirror surface offering sharp environment reflections.',
  },
  {
    id: 'p5',
    name: 'Glazed Jade',
    key: 'ceramic',
    params: {
      ...DEFAULT_PARAMS.ceramic,
      color: '#10b981', // Jade green
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    },
    description: 'Deep semi-opaque jade with a glossy double-fired vitreous silica glaze.',
  },
  {
    id: 'p6',
    name: 'Raw Terracotta',
    key: 'ceramic',
    params: {
      ...DEFAULT_PARAMS.ceramic,
      color: '#c2410c', // Burnt orange
      roughness: 0.65,
      clearcoat: 0.0,
      sheen: 0.0,
    },
    description: 'Earthy unglazed clay baked at high temperatures, showing matte, micro-rough porous finish.',
  },
  {
    id: 'p7',
    name: 'Royal Velvet',
    key: 'fabric',
    params: {
      ...DEFAULT_PARAMS.fabric,
      color: '#6d28d9', // Deep purple
      roughness: 0.75,
      sheen: 1.0,
      sheenColor: '#a78bfa',
      bumpType: 'dots',
      bumpScale: 0.02,
      bumpFrequency: 60,
    },
    description: 'Soft-pile velvet featuring high micro-surface sheen angles and rich magenta highlights.',
  },
  {
    id: 'p8',
    name: 'Indigo Denim',
    key: 'fabric',
    params: {
      ...DEFAULT_PARAMS.fabric,
      color: '#1e3a8a', // Blue denim
      roughness: 0.85,
      sheen: 0.3,
      sheenColor: '#3b82f6',
      bumpType: 'weave',
      bumpScale: 0.06,
      bumpFrequency: 35,
    },
    description: 'Heavy twill cotton with prominent repeating cross-weave pattern and rigid texture.',
  },
];

export const ENVIRONMENTS: EnvironmentPreset[] = [
  {
    id: 'studio',
    name: 'Studio Softbox',
    description: 'Clean photography studio with balanced neutral key lights and a clean backdrop.',
    ambientColor: '#ffffff',
    ambientIntensity: 0.5,
    keyLightColor: '#ffffff',
    fillLightColor: '#f1f5f9',
    bgColor: '#0f172a', // deep slate/blue-gray dark background
    gridColor: '#334155',
  },
  {
    id: 'sunset',
    name: 'Golden Sunrise',
    description: 'Warm golden sunlight casting long soft shadows paired with cool dawn ambient tones.',
    ambientColor: '#38bdf8', // Light blue fill
    ambientIntensity: 0.4,
    keyLightColor: '#f59e0b', // Golden yellow
    fillLightColor: '#6366f1', // Indigo backlight
    bgColor: '#0c0a09', // warm charcoal background
    gridColor: '#292524',
  },
  {
    id: 'neon',
    name: 'Cyberpunk Neon',
    description: 'Striking high-contrast pink and cyan ambient lights, perfect for exploring reflective metal and glass.',
    ambientColor: '#1e1b4b', // deep violet
    ambientIntensity: 0.3,
    keyLightColor: '#ec4899', // bright magenta
    fillLightColor: '#06b6d4', // electric cyan
    bgColor: '#050505', // near pure black
    gridColor: '#1e1b4b',
  },
];

export const STARTER_CUSTOM_PRESETS: CustomPreset[] = [
  {
    id: 'c1',
    name: '24K Gold Alloy',
    basePreset: 'metal',
    params: {
      ...DEFAULT_PARAMS.metal,
      color: '#facc15',
      roughness: 0.1,
    },
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
  },
  {
    id: 'c2',
    name: 'Emerald Crystal',
    basePreset: 'glass',
    params: {
      ...DEFAULT_PARAMS.glass,
      color: '#059669',
      roughness: 0.03,
      ior: 1.61,
      transmission: 0.95,
      thickness: 3.0,
    },
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
  },
];

export const COLOR_SWATCHES = [
  '#ffffff', // Pure White
  '#94a3b8', // Silver Slate
  '#3b82f6', // Cobalt Blue
  '#10b981', // Jade Green
  '#ef4444', // Ruby Red
  '#f59e0b', // Amber Gold
  '#ec4899', // Hot Magenta
  '#8b5cf6', // Amethyst Violet
  '#171717', // Onyx Black
];
