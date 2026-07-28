export type SculpturalShape = 'torusKnot' | 'roundedCube' | 'gem' | 'sphere';

export interface MaterialParams {
  color: string;
  roughness: number;
  metalness: number;
  transmission: number; // For glass/translucency
  ior: number; // Index of Refraction
  thickness: number; // Transmission thickness
  clearcoat: number; // For ceramic glaze
  clearcoatRoughness: number;
  sheen: number; // For fabric softness
  sheenColor: string;
  bumpScale: number; // For fabric/pattern scale
  bumpType: 'none' | 'weave' | 'dots' | 'noise';
  bumpFrequency: number;
}

export type PresetKey = 'glass' | 'metal' | 'ceramic' | 'fabric';

export interface MaterialPreset {
  id: string;
  name: string;
  key: PresetKey;
  params: MaterialParams;
  description: string;
}

export type EnvironmentType = 'studio' | 'sunset' | 'neon';

export interface EnvironmentPreset {
  id: EnvironmentType;
  name: string;
  description: string;
  ambientColor: string;
  ambientIntensity: number;
  keyLightColor: string;
  fillLightColor: string;
  bgColor: string;
  gridColor: string;
}

export interface LightParams {
  intensity: number;
  color: string;
  yaw: number; // rotation around Y axis in degrees
  pitch: number; // height angle in degrees
  distance: number;
  shadows: boolean;
}

export interface CustomPreset {
  id: string;
  name: string;
  basePreset: PresetKey;
  params: MaterialParams;
  createdAt: number;
}
