import { Particle } from "./Particle";
import { IParticleParams, TPresets } from "../types";
import { DEFAULTS } from "../lib/defaults";
import { deepMerge } from "../utils/config";
import { applyAttraction } from "../utils/physics";
import { applyInteractions } from "../utils/interaction";
import { QuadTree, Boundary } from "../utils/QuadTree";

/**
 * Engine class to manage particles and rendering. This is where all the magic happens
 * - initializing particles, handling the render loop, and managing interactions.
 */
export class Engine {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  private config: Required<IParticleParams>;
  private mouse = { x: 0, y: 0, active: false };
  private animationId: number = 0;
  private canvas: HTMLCanvasElement;
  private lastTimestamp: number = 0;
  private firstFrame: boolean = true;
  private onLoaded?: () => void;
  private loaded = false;

  /**
   * Creates an instance of the Engine.
   * @param canvas The HTML canvas element where particles will be rendered.
   * @param params Configuration parameters for particles.
   * @param preset Preset configuration to use as a base.
   */
  constructor(
    canvas: HTMLCanvasElement,
    params: IParticleParams,
    preset: TPresets,
    onLoaded?: () => void,
  ) {
    // Get 2D rendering context
    this.ctx = canvas.getContext("2d", { alpha: true })!;

    // Merge user params with preset defaults, ensuring all fields are populated
    this.config = deepMerge(DEFAULTS[preset], params);
    this.canvas = canvas;

    // Set up the onLoaded callback if provided
    this.onLoaded = onLoaded;

    // Initial setup
    this.resizeCanvas();
    this.init();
    this.bindEvents();
  }

  /**
   * Resizes the canvas to match its displayed size.
   */
  private resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  /**
   * Handles window resize events to adjust canvas size and reinitialize particles.
   */
  private handleResize = () => {
    this.resizeCanvas();
    this.init();
  };

  /**
   * Initializes particles based on the current configuration.
   */
  private init() {
    this.particles = [];
    const count = this.calculateParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.canvas, this.config));
    }

    // Wait for all particle images to load before calling onLoaded
    Promise.all(this.particles.map((p) => p.whenLoaded())).then(() => {
      if (!this.loaded) {
        this.loaded = true;
        this.onLoaded?.();
      }
    });
  }

  /**
   * Calculate the particle count based on density settings.
   * @returns  The calculated number of particles.
   */
  private calculateParticleCount(): number {
    const { value, density } = this.config.number;
    if (!density.enable) return value; // If density is disabled, return the fixed value.

    // Calculate based on canvas area and density area setting
    const canvasArea = this.canvas.width * this.canvas.height;
    const densityArea = Math.max(density.area, 0.001) * 1000; // Multiply by 1000 to scale appropriately
    const count = Math.floor((canvasArea / densityArea) * value);

    // PERFORMANCE CAP: Even if density is 1, don't exceed 2000 particles.
    // Standard hardware starts lagging around 1500-2000 with interactions.
    // Might revisit this cap in future versions with optimizations.
    return Math.min(count, 2000);
  }

  /**
   * Binds necessary event listeners for interactivity.
   */
  private bindEvents() {
    // Determine the target for mouse events based on configuration
    const target =
      this.config.interactivity.detect_on === "window" ? window : this.canvas;
    target.addEventListener("mousemove", (e) => this.handleMouseMove(e as any));
    target.addEventListener("mouseleave", this.handleMouseLeave);
    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("click", this.handleClick);
  }

  /**
   * Handles mouse move events to update the mouse position.
   * @param e The mouse event.
   */
  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.active = true;
  };

  /**
   * Handles mouse leave events to deactivate mouse interactions.
   * @returns void
   */
  private handleMouseLeave = () => (this.mouse.active = false);

  /**
   * Handles click events to add or remove particles based on configuration.
   * @returns void
   */
  private handleClick = () => {
    const { onclick } = this.config.interactivity.events;
    if (!onclick.enable) return; // Do nothing if click interactions are disabled.

    const modes = this.config.interactivity.modes;

    // In original Particles.js, the push mode just adds a fixed number of particles
    if (onclick.mode === "push") {
      for (let i = 0; i < modes.push.quantity; i++) {
        this.particles.push(
          new Particle(this.canvas, this.config, {
            x: this.mouse.x,
            y: this.mouse.y,
          }),
        );
      }

      // Remove the closest particles to the click position
    } else if (onclick.mode === "remove") {
      // Sort particles by distance to mouse click position
      this.particles.sort((a, b) => {
        const dxA = a.x - this.mouse.x;
        const dyA = a.y - this.mouse.y;
        const distA = dxA * dxA + dyA * dyA;
        const dxB = b.x - this.mouse.x;
        const dyB = b.y - this.mouse.y;
        const distB = dxB * dxB + dyB * dyB;
        return distA - distB;
      });

      // Remove the closest 'quantity' particles
      this.particles.splice(0, modes.remove.quantity);
    }
  };

  /**
   * The main render loop, called on each animation frame.
   * @param timestamp The current time provided by requestAnimationFrame.
   */
  public render = (timestamp: number = 0) => {
    // Handle the first frame initialization
    // This ensures consistent timing for the first update
    if (this.firstFrame) {
      this.lastTimestamp = timestamp;
      this.firstFrame = false;
      this.animationId = requestAnimationFrame(this.render);
      return;
    }

    // Calculate elapsed time since last frame
    let elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Cap elapsed time to avoid large jumps (e.g., when switching tabs)
    if (elapsed > 100) {
      elapsed = 16.67;
    }

    // Normalize delta to a 60fps baseline (This is for smoother animations across varying frame rates)
    const delta = elapsed / (1000 / 60);

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Build the QuadTree for spatial partitioning
    // This optimizes interaction calculations from O(n^2) to O(n log n)
    const qtree = new QuadTree(new Boundary(0, 0, width, height));
    for (const p of this.particles) {
      qtree.insert(p);
    }

    // Apply attraction and other interactions
    applyAttraction(this.particles, this.config, qtree);
    applyInteractions(qtree, this.mouse, this.config, this.ctx, this.particles);

    // Update and draw each particle
    for (let i = 0, len = this.particles.length; i < len; i++) {
      const p = this.particles[i];
      p.update(delta);
      p.draw(this.ctx);
    }

    // Request the next frame
    this.animationId = requestAnimationFrame(this.render);
  };

  /**
   * Cleans up resources and stops the engine.
   */
  destroy() {
    // Stop the animation loop
    cancelAnimationFrame(this.animationId);

    // Remove event listeners
    const target =
      this.config.interactivity.detect_on === "window" ? window : this.canvas;
    target.removeEventListener("mousemove", (e) =>
      this.handleMouseMove(e as any),
    );
    target.removeEventListener("mouseleave", this.handleMouseLeave);
    window.removeEventListener("resize", this.handleResize);
    this.canvas.removeEventListener("click", this.handleClick);

    // Destroy all particles
    this.particles.forEach((p) => p.destroy());
    this.particles.length = 0; // clear the array
  }
}
