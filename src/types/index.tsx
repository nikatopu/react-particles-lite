/**
 * Types and interfaces for particle configurations.
 */
export type TParticleShape =
  | "circle"
  | "edge"
  | "triangle"
  | "polygon"
  | "star"
  | "image";

/**
 * Possible directions for particle movement.
 */
export type TParticleMoveDirection =
  | "none"
  | "top"
  | "top-left"
  | "right"
  | "top-right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"
  | number;

/**
 * Interface representing the parameters for a particle.
 * These parameters define the behavior and appearance of particles.
 * They can be extended to include more features as needed.
 */
export interface IParticleParams {
  number?: {
    value: number;
    density: { enable: boolean; area: number };
  };
  color?: { value: string | string[] };
  shape?: {
    type: TParticleShape;
    images?: string[];
    polygon?: { sides: number };
  };
  opacity?: {
    value: number;
    random: boolean;
    anim: {
      enable: boolean;
      speed: number;
      opacity_min: number;
      sync: boolean;
    };
  };
  size?: {
    value: number;
    random: boolean;
    anim: { enable: boolean; speed: number; size_min: number; sync: boolean };
  };
  rotate?: {
    enable: boolean;
    value: number;
    random: boolean;
    anim: {
      enable: boolean;
      speed: number;
      direction: "clockwise" | "counter-clockwise";
      sync: boolean;
    };
  };
  move?: {
    enable: boolean;
    speed: number;
    straight: boolean;
    out_mode: "out" | "bounce";
    randomized: { enable: boolean; min?: number; max?: number };
    direction: { to: TParticleMoveDirection; random: boolean };
    attract: { enable: boolean; rotateX: number; rotateY: number };
  };
  sway?: {
    enable: boolean;
    amplitude: number;
    frequency: number;
    random: boolean;
  };
  depthBlur?: { enable: boolean; focus: number; maxBlur: number };
  interactivity?: {
    detect_on: "canvas" | "window";
    events: {
      onhover: { enable: boolean; mode: "grab" | "bubble" | "repulse" };
      onclick: {
        enable: boolean;
        mode: "push" | "remove";
      };
    };
    modes: {
      grab: { distance: number };
      bubble: {
        distance: number;
        size: number;
        duration: number;
        opacity?: number;
      };
      repulse: { distance: number; duration: number };
      push: { quantity: number };
      remove: { quantity: number };
    };
  };
}

// Define presets and defaults
export type TPresets = "default";
export type TDefaults = { [key in TPresets]: Required<IParticleParams> };
