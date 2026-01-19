import { useEffect, useRef } from "react";
import { Engine } from "./classes/Engine";
import { IParticleParams, TPresets } from "./types";

/**
 * The Particles React component that initializes and renders the particle engine.
 * @param props Component properties including params, className, preset, and onLoaded callback.
 * @returns A React functional component rendering a canvas element for particles.
 */
export const Particles: React.FC<{
  params?: IParticleParams;
  className?: string;
  preset?: TPresets;
  onLoaded?: () => void;
}> = ({ params = {}, className, preset = "default", onLoaded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsKey = JSON.stringify(params) + preset;

  useEffect(() => {
    let engine: Engine | null = null; // To hold the engine instance

    if (canvasRef.current) {
      engine = new Engine(canvasRef.current, params, preset, onLoaded);
      engine.render();
    }

    return () => {
      engine?.destroy();
    };
  }, [paramsKey]); // Re-run effect if params or preset change

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};
