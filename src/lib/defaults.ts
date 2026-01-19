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
  snow: {
    number: {
      value: 683,
      density: {
        enable: true,
        area: 499,
      },
    },
    shape: {
      type: "circle",
      images: [],
      polygon: {
        sides: 4,
      },
    },
    size: {
      value: 5,
      random: true,
      anim: {
        enable: false,
        speed: 4,
        size_min: 1,
        sync: false,
      },
    },
    color: {
      value: "#bff8ff",
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    depthBlur: {
      enable: true,
      focus: 0.1,
      maxBlur: 0.9,
    },
    move: {
      enable: true,
      speed: 6,
      randomized: {
        enable: true,
        min: 1,
        max: 3,
      },
      direction: {
        to: "bottom",
        random: false,
      },
      straight: false,
      out_mode: "out",
      attract: {
        enable: false,
        rotateX: 1000,
        rotateY: 1000,
      },
    },
    sway: {
      enable: true,
      amplitude: 4,
      frequency: 0.01,
      random: true,
    },
    rotate: {
      enable: true,
      value: 0,
      random: false,
      anim: {
        enable: false,
        speed: 2,
        direction: "counter-clockwise",
        sync: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "repulse",
        },
        onclick: {
          enable: false,
          mode: "push",
        },
      },
      modes: {
        grab: {
          distance: 100,
        },
        bubble: {
          distance: 200,
          size: 80,
          duration: 0.4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
        remove: {
          quantity: 2,
        },
      },
    },
  },
  fireflies: {
    number: {
      value: 683,
      density: {
        enable: true,
        area: 759,
      },
    },
    shape: {
      type: "circle",
      images: [],
      polygon: {
        sides: 4,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: true,
        speed: 4,
        size_min: 1,
        sync: false,
      },
    },
    color: {
      value: "#e1ff00",
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: true,
        speed: 5,
        opacity_min: 0.1,
        sync: false,
      },
    },
    depthBlur: {
      enable: true,
      focus: 0.1,
      maxBlur: 0.9,
    },
    move: {
      enable: true,
      speed: 3,
      randomized: {
        enable: true,
        min: 1,
        max: 3,
      },
      direction: {
        to: "bottom",
        random: true,
      },
      straight: false,
      out_mode: "bounce",
      attract: {
        enable: false,
        rotateX: 1000,
        rotateY: 1000,
      },
    },
    sway: {
      enable: false,
      amplitude: 4,
      frequency: 0.01,
      random: true,
    },
    rotate: {
      enable: true,
      value: 0,
      random: false,
      anim: {
        enable: false,
        speed: 2,
        direction: "counter-clockwise",
        sync: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse",
        },
        onclick: {
          enable: false,
          mode: "push",
        },
      },
      modes: {
        grab: {
          distance: 100,
        },
        bubble: {
          distance: 200,
          size: 80,
          duration: 0.4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
        remove: {
          quantity: 2,
        },
      },
    },
  },
  stars: {
    number: {
      value: 600,
      density: {
        enable: true,
        area: 750,
      },
    },
    shape: {
      type: "star",
      images: [],
      polygon: {
        sides: 4,
      },
    },
    size: {
      value: 6,
      random: true,
      anim: {
        enable: true,
        speed: 4,
        size_min: 1,
        sync: false,
      },
    },
    color: {
      value: "#e1ff00",
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    depthBlur: {
      enable: true,
      focus: 0.1,
      maxBlur: 0.9,
    },
    move: {
      enable: false,
      speed: 6,
      randomized: {
        enable: true,
        min: 1,
        max: 3,
      },
      direction: {
        to: "bottom",
        random: false,
      },
      straight: false,
      out_mode: "out",
      attract: {
        enable: false,
        rotateX: 1000,
        rotateY: 1000,
      },
    },
    sway: {
      enable: false,
      amplitude: 4,
      frequency: 0.01,
      random: true,
    },
    rotate: {
      enable: true,
      value: 0,
      random: false,
      anim: {
        enable: false,
        speed: 2,
        direction: "counter-clockwise",
        sync: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "repulse",
        },
        onclick: {
          enable: false,
          mode: "push",
        },
      },
      modes: {
        grab: {
          distance: 100,
        },
        bubble: {
          distance: 200,
          size: 80,
          duration: 0.4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
        remove: {
          quantity: 2,
        },
      },
    },
  },
};
