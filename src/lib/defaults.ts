import { IParticleParams, TDefaults } from "../types";

/**
 * Default particle configurations for different presets.
 * This should be used as a base and can be overridden by user-defined settings.
 * Additional parameters can be used on the frontend for quick tutorials.
 */
export const DEFAULTS: TDefaults = {
  default: {
    number: { value: 50, density: { enable: true, area: 800 } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: {
      value: 0.5,
      random: false,
      anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 4, size_min: 0.1, sync: false },
    },
    rotate: {
      enable: true,
      value: 45,
      random: false,
      anim: {
        enable: true,
        speed: 2,
        direction: "counter-clockwise",
        sync: false,
      },
    },
    move: {
      enable: true,
      speed: 2,
      direction: {
        to: "none",
        random: false,
      },
      randomized: {
        enable: false,
      },
      straight: false,
      out_mode: "out",
      attract: { enable: false, rotateX: 3000, rotateY: 3000 },
    },
    sway: {
      enable: true,
      amplitude: 10, // Moves 10px side to side
      frequency: 0.05, // Gentle speed
      random: true, // Essential for a natural look
    },
    depthBlur: {
      enable: true,
      focus: 0.1,
      maxBlur: 8,
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 100 },
        bubble: { distance: 200, size: 80, duration: 0.4 },
        repulse: { distance: 200, duration: 0.4 },
        push: { quantity: 4 },
        remove: { quantity: 2 },
      },
    },
  },
};
