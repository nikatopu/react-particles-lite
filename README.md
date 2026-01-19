# React Particles Lite

A high-performance, lightweight particle engine for React. Built with TypeScript and optimized with **QuadTree spatial partitioning**, image caching and physics for smooth 60FPS interactions even with hundreds of particles.

[![npm version](https://img.shields.io/npm/v/react-particles-lite.svg)](https://www.npmjs.com/package/react-particles-lite)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- 🚀 **Performant:** Uses QuadTree for O(n log n) interaction calculations.
- 🛠 **Customizable:** Control shapes, movement, sway, depth blur, and interactivity.
- 📱 **Responsive:** Automatically handles canvas resizing.
- 📦 **Zero Dependencies:** Only depends on React as a peer dependency.
- 🎨 **Presets:** Built-in default preset to get started in seconds.

## Installation

```bash
npm install react-particles-lite
# or
yarn add react-particles-lite
```

## Live Demo

You can check out the live demo of this particles node module working, where you can also import and export the config for later usage, on my website:

https://particles-lite-review.nikatopu.dev/

## Quick Start

```tsx
import { Particles } from "react-particles-lite";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Particles
        preset="default"
        params={{
          number: { value: 100, density: { enable: true, area: 800 } },
          color: { value: "#ffffff" },
          move: { speed: 1.5 },
        }}
      />
    </div>
  );
}
```

## Props

| Prop         | Type         | Default      | Description  |
| ------------ | ------------ | ------------ | ------------ |
| `params` | `IParticleParams` | `{}` | Advanced configuration object. |
| `preset` | `TPresets` | `"default"` | Base configuration template. |
| `className` | `string` | `undefined` | CSS class for the canvas element. |
| `onLoaded` | `() => void` | `undefined` | Callback fired when all assets (images) are loaded. | 


## Configuration Options (`IParticleParams`)
| Option | Description |
| --- | --- |
| `number` | Control the quantity and the density of the particles. |
| `shape` | Supports `circle`, `edge`, `triangle`, `polygon`, `star` and `image`. |
| `opacity` | Static or animated opacity settings. |
| `size` | Static or pulsating size settings. |
| `move` | Speed, direction and out-of-bounds behavior. |
| `interactivity` | Mouse hover (`grab`, `bubble`, `repulse`) and click (`push`, `remove`) events. |
| `depthBlur` | Simulates depth of field based on particle size. |
| `sway` | Adds organic, oscillating movement |

## License

ISC © Nikoloz Topuridze