import { IParticleParams } from "../types";
import { DIRECTION_MAP, handleOutMode } from "../utils/physics";
import { ShapeDrawers } from "../utils/shapeDrawers";

/**
 * Particle class representing individual particles.
 */
export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialRadius: number;
  initialOpacity: number;
  radius: number;
  opacity: number;
  rotation: number = 0;
  rotationRadians: number = 0;

  imgObj?: HTMLImageElement;
  parameters: Required<IParticleParams>;
  private colorCache: string;

  private opacityDirection: number = 1;
  private sizeDirection: number = 1;
  private swayPhase: number = 0;
  private sprites: HTMLCanvasElement[] = [];
  private imageLoaded: Promise<void>;

  /**
   * Initializes a new Particle instance.
   * @param canvas The canvas where the particle will be rendered.
   * @param p The particle parameters/configuration. Required to define behavior and appearance.
   * @param position (Optional) Initial position of the particle. If not provided, a random position is assigned.
   */
  constructor(
    private canvas: HTMLCanvasElement,
    private p: Required<IParticleParams>,
    position?: { x: number; y: number },
  ) {
    this.parameters = p;

    // Calculate spawn buffer to allow spawning slightly off-canvas
    const spawnBuffer = p.size.value * 2;

    // Set initial position, if not provided, randomize within canvas + buffer
    this.x =
      position?.x ??
      Math.random() * (canvas.width + spawnBuffer * 2) - spawnBuffer;
    this.y =
      position?.y ??
      Math.random() * (canvas.height + spawnBuffer * 2) - spawnBuffer;

    // Initial velocity
    this.vx = 0;
    this.vy = 0;

    // Cache color once, as it doesn't change per particle
    this.colorCache = Array.isArray(this.p.color.value)
      ? this.p.color.value[0]
      : this.p.color.value;

    // Initialize opacity with potential randomness and animation settings
    const opacityCfg = p.opacity;
    const oAnim = opacityCfg.anim;

    // Set initial opacity, if animation is enabled and not synced, randomize within range
    if (oAnim.enable && !oAnim.sync) {
      this.opacity =
        Math.random() * (opacityCfg.value - oAnim.opacity_min) +
        oAnim.opacity_min;
      this.opacityDirection = Math.random() > 0.5 ? 1 : -1;
    } else {
      // If no animation or synced, set to base value with optional randomness
      this.opacity = (opacityCfg.random ? Math.random() : 1) * opacityCfg.value;
      this.opacityDirection = 1;
    }

    // Cache initial opacity
    this.initialOpacity = this.opacity;

    // Initialize size with potential randomness and animation settings
    const sizeCfg = p.size;
    const sAnim = sizeCfg.anim;

    if (sAnim.enable && !sAnim.sync) {
      // If animation enabled and sync disabled randomize initial size within animation range
      this.radius =
        Math.random() * (sizeCfg.value - sAnim.size_min) + sAnim.size_min;
      this.sizeDirection = Math.random() > 0.5 ? 1 : -1;
    } else {
      // If no animation or synced, set to base value with optional randomness
      this.radius = (sizeCfg.random ? Math.random() : 1) * sizeCfg.value;
      this.sizeDirection = 1;
    }

    // Cache initial size
    this.initialRadius = this.radius;

    // Initialize rotation if enabled
    const rotateCfg = p.rotate;

    if (rotateCfg.enable) {
      this.rotation =
        (rotateCfg.anim.enable && !rotateCfg.anim.sync) || rotateCfg.random
          ? Math.random() * 360
          : rotateCfg.value;
      this.rotationRadians = (this.rotation * Math.PI) / 180;
    }

    // Initialize sway if enabled
    if (this.p.sway.enable) {
      this.swayPhase = this.p.sway.random ? Math.random() * Math.PI * 2 : 0;
    }

    // Initialize velocity and image
    this.initVelocity();
    this.imageLoaded = this.initImage();

    // Pre-cache depth blur sprites if enabled
    if (this.p.depthBlur.enable) this.cacheSprites();
  }

  /**
   * Pre-renders sprites for depth blur effect.
   * This optimizes rendering by avoiding real-time blur calculations.
   * We sacrifice some memory to gain performance.
   */
  private cacheSprites() {
    const { maxBlur, focus } = this.p.depthBlur;
    const maxSize = this.p.size.value;
    const depthLevels = [0.15, 0.5, 0.85]; // Near, mid, far depths

    // Pre-render sprites for each depth level
    this.sprites = depthLevels.map((d) => {
      const offscreen = document.createElement("canvas");

      // Calculate blur based on distance from focus
      const dist = Math.abs(d - focus);
      const blur = dist * maxBlur;
      const padding = blur * 2;
      const canvasSize = Math.ceil((maxSize + padding) * 2);

      offscreen.width = canvasSize;
      offscreen.height = canvasSize;

      // Get 2D rendering context for offscreen canvas
      const octx = offscreen.getContext("2d")!;
      if (blur > 0.5) octx.filter = `blur(${blur.toFixed(1)}px)`;

      // Center the drawing
      octx.translate(canvasSize / 2, canvasSize / 2);
      octx.fillStyle = this.colorCache;

      // Use a drawer strategy to draw the shape
      // This allows for easy extension of shapes in the future
      const drawer = ShapeDrawers[this.p.shape.type] || ShapeDrawers.circle;
      drawer(octx, maxSize, this.p, this.imgObj);
      return offscreen;
    });
  }

  /**
   * Gets the depth of the particle relative to its size.
   * This is used for depth-based effects like depth blur.
   * Bigger particles are considered "closer" (lower depth value).
   * @returns A normalized depth value between 0 (closest) and 1 (farthest).
   */
  getDepth(): number {
    const sizeCfg = this.p.size;
    const minSize = sizeCfg.anim.enable ? sizeCfg.anim.size_min : 0;
    return (this.radius - minSize) / (sizeCfg.value - minSize || 1);
  }

  /**
   * Handles sway motion for the particle.
   * @param delta Time elapsed since last frame
   * @returns void
   */
  private handleSway(delta: number) {
    if (!this.p.sway.enable) return; // If sway is disabled, do nothing

    this.swayPhase += this.p.sway.frequency * delta;
    // Sway effect using cosine for smooth oscillation
    this.x += Math.cos(this.swayPhase) * (this.p.sway.amplitude * 0.1) * delta;
  }

  /**
   * Handle opacity animation based on configuration.
   * @param delta Time elapsed since last frame
   * @returns void
   */
  private handleOpacityAnimation(delta: number) {
    const anim = this.p.opacity.anim;
    if (!anim.enable) return; // If animation is disabled, do nothing

    // This will increase or decrease opacity based on direction
    // It will create an effect of fading in and out
    this.opacity += (anim.speed / 1000) * this.opacityDirection * delta;
    if (this.opacity >= this.p.opacity.value) {
      this.opacityDirection = -1;
      this.opacity = this.p.opacity.value;
    } else if (this.opacity <= anim.opacity_min) {
      this.opacityDirection = 1;
      this.opacity = anim.opacity_min;
    }

    if (this.opacity < 0) this.opacity = 0; // Prevent negative opacity
    if (this.opacity > 1) this.opacity = 1; // Cap opacity at 1
    this.initialOpacity = this.opacity;
  }

  /**
   * Handle size animation based on configuration.
   * @param delta Time elapsed since last frame
   * @returns void
   */
  private handleSizeAnimation(delta: number) {
    const anim = this.p.size.anim;
    if (!anim.enable) return; // If animation is disabled, do nothing

    // This will increase or decrease size based on direction
    // It will create a pulsating effect
    this.radius += (anim.speed / 100) * this.sizeDirection * delta;
    if (this.radius >= this.p.size.value) {
      this.sizeDirection = -1;
      this.radius = this.p.size.value;
    } else if (this.radius <= anim.size_min) {
      this.sizeDirection = 1;
      this.radius = anim.size_min;
    }

    if (this.radius < 0) this.radius = 0; // Prevent negative size
    if (this.radius > this.p.size.value) this.radius = this.p.size.value; // Cap size at max
    this.initialRadius = this.radius;
  }

  /**
   * Handles rotation animation based on configuration.
   * @param delta Time elapsed since last frame
   * @returns void
   */
  private handleRotationAnimation(delta: number) {
    const rotateCfg = this.p.rotate;
    if (!rotateCfg.enable || !rotateCfg.anim.enable) return; // If rotation or animation is disabled, do nothing

    // Update rotation based on speed and direction
    const { speed, direction } = rotateCfg.anim;
    this.rotation += speed * (direction === "clockwise" ? 1 : -1) * delta;

    // Keep rotation within 0-360 degrees
    if (this.rotation > 360) this.rotation -= 360;
    else if (this.rotation < 0) this.rotation += 360;

    this.rotationRadians = (this.rotation * Math.PI) / 180;
  }

  /**
   * Initialize the particle's velocity based on movement configuration.
   * @returns void
   */
  private initVelocity() {
    if (!this.p.move.enable) return; // If movement is disabled, do nothing

    const { speed, direction, randomized } = this.p.move;
    const multiplier = DIRECTION_MAP[direction.to] || { x: 1, y: 1 }; // Default to "none" direction

    // Determine direction components, if random is true, use random values
    const dirX = direction.random ? Math.random() - 0.5 : multiplier.x;
    const dirY = direction.random ? Math.random() - 0.5 : multiplier.y;

    // Calculate randomized speed within specified range, use 1 and 5 as defaults
    const randomizedSpeed = Math.max(
      Math.min(Math.random() * speed, randomized.max ?? 5),
      randomized.min ?? 1,
    );
    const varSpeed = randomized.enable ? randomizedSpeed : speed;

    // Set velocity components
    this.vx = dirX * varSpeed;
    this.vy = dirY * varSpeed;
  }

  /**
   * Initializes the image object if the particle shape is an image.
   * This preloads the image for rendering.
   * @returns A promise that resolves when the image is loaded.
   */
  private initImage(): Promise<void> {
    const { shape } = this.p;
    if (shape.type === "image" && shape.images?.length) {
      // If shape is image and images are provided, load a random image from the array
      // For now, we have no ordering, but that would be easy to add later as an additional config
      this.imgObj = new Image();
      this.imgObj.src =
        shape.images[Math.floor(Math.random() * shape.images.length)];

      // Return a promise that resolves when the image is loaded
      return new Promise((resolve) => {
        this.imgObj!.onload = () => resolve();
        this.imgObj!.onerror = () => resolve(); // fail-safe
      });
    }

    // If it is not an image, instantly resolve
    return Promise.resolve();
  }

  /**
   * Drawing the particle on the provided canvas context, used to call every frame.
   * @param ctx The 2D rendering context of the canvas.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const useRotate = this.p.rotate.enable; // Are we using rotation for this particle?

    // Save the context state before applying transformations
    ctx.save();
    ctx.translate(this.x, this.y);

    if (useRotate) ctx.rotate(this.rotationRadians); // Apply rotation if enabled

    // Set global alpha for opacity
    ctx.globalAlpha =
      this.opacity < 0 ? 0 : this.opacity > 1 ? 1 : this.opacity;

    // If we are using depth blur and have sprites cached, draw the appropriate sprite
    if (this.p.depthBlur.enable && this.sprites.length > 0) {
      // Determine which sprite to use based on depth
      const depth = this.getDepth();
      // Get sprite index: 0 (near), 1 (mid), 2 (far)
      const spriteIdx = depth > 0.66 ? 2 : depth > 0.33 ? 1 : 0;
      // Draw the sprite centered at (0,0)
      const sprite = this.sprites[spriteIdx];
      // Scale sprite to current particle size
      const scale = this.radius / this.p.size.value;
      const drawSize = sprite.width * scale;
      // Draw the sprite centered
      ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      // If no depth blur, draw normally
      ctx.fillStyle = this.colorCache; // Use cached color

      // Use a drawer strategy to draw the shape
      // This allows for easy extension of shapes in the future
      const drawer = ShapeDrawers[this.p.shape.type] || ShapeDrawers.circle;
      drawer(ctx, this.radius, this.p, this.imgObj);
    }
    ctx.restore();
  }

  /**
   * Updates particle state.
   * @param delta Factor to normalize speed across different frame rates (1.0 at 60fps).
   */
  update(delta: number) {
    // Update position based on velocity and delta
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Handle various animations and effects
    handleOutMode(this, this.canvas);
    if (this.p.sway.enable) this.handleSway(delta); // Sway effect
    if (this.p.opacity.anim.enable) this.handleOpacityAnimation(delta); // Opacity animation
    if (this.p.size.anim.enable) this.handleSizeAnimation(delta); // Size animation
    if (this.p.rotate.enable && this.p.rotate.anim.enable)
      this.handleRotationAnimation(delta); // Rotation animation
  }

  /**
   * Get the particle parameters.
   * @returns The particle parameters.
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Returns the current width of the particle in pixels.
   * For most shapes, this is the diameter (radius * 2).
   * @returns {number} The width in pixels.
   */
  public getWidthInPixels(): number {
    return this.radius * 2;
  }

  /**
   * Returns the current height of the particle in pixels.
   * For most shapes, this is the diameter (radius * 2).
   * @returns {number} The height in pixels.
   */
  public getHeightInPixels(): number {
    return this.radius * 2;
  }

  /**
   * Returns a promise that resolves when the particle's image is loaded.
   * @returns A promise that resolves when the image is loaded.
   */
  public whenLoaded(): Promise<void> {
    return this.imageLoaded;
  }

  /**
   * Destroys the particle and cleans up resources.
   */
  public destroy() {
    // Clear the image reference
    this.imgObj = undefined;

    // Clear sprites
    this.sprites = [];
  }
}
