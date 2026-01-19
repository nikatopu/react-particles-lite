import { IParticleParams } from "../types";

/**
 * Type definition for a shape drawer function.
 * This function draws a specific shape on the canvas context.
 */
type Drawer = (
  ctx: CanvasRenderingContext2D,
  radius: number,
  p: Required<IParticleParams>,
  img?: HTMLImageElement,
) => void;

// Precompute constants
const PI2 = Math.PI * 2;

/**
 * Shape drawing functions for different particle shapes.
 * Each function takes a canvas context, radius, particle parameters, and an optional image.
 */
export const ShapeDrawers: Record<string, Drawer> = {
  /**
   * Draws a cirlce on the given canvas
   * @param ctx The canvas context to draw on
   * @param radius The radius of the circle
   */
  circle: (ctx, radius) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, PI2);
    ctx.fill();
  },

  /**
   * Draws an image on the canvas with size based on the radius
   * @param ctx The canvas context to draw on
   * @param radius The radius determining the size of the image
   * @param _ Unused parameter
   * @param img The image to draw
   */
  image: (ctx, radius, _, img) => {
    if (img?.complete) {
      const size = radius * 2;
      ctx.drawImage(img, -radius, -radius, size, size);
    }
  },

  /**
   * Draws a triangle on the canvas
   * @param ctx The canvas context to draw on
   * @param radius The radius of the triangle ( distance from center to vertex )
   */
  triangle: (ctx, radius) => {
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius, radius);
    ctx.lineTo(-radius, radius);
    ctx.fill();
  },

  /**
   * Draws a custom polygon on the canvas
   * @param ctx The canvas context to draw on
   * @param radius The radius of the polygon ( distance from center to vertex )
   * @param p The particle parameters containing shape details
   */
  polygon: (ctx, radius, p) => {
    const sides = p.shape.polygon?.sides || 5;
    const step = PI2 / sides;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = i * step - Math.PI / 2;
      ctx.lineTo(radius * Math.cos(a), radius * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  },

  /**
   * Draws a star shape on the canvas based on the number of sides
   * @param ctx The canvas context to draw on
   * @param radius The radius of the star ( distance from center to outer vertex )
   * @param p The particle parameters containing shape details
   */
  star: (ctx, radius, p) => {
    const sides = p.shape.polygon?.sides || 5;
    const step = Math.PI / sides;
    const innerRadius = radius * 0.5;
    ctx.beginPath();
    for (let i = 0; i < sides * 2; i++) {
      const r = i % 2 === 0 ? radius : innerRadius;
      const a = i * step - Math.PI / 2;
      ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  },

  /**
   * Draws an edge (rectangle) on the canvas
   * @param ctx The canvas context to draw on
   * @param radius The radius of the rectangle ( distance from center to vertex )
   */
  edge: (ctx, radius) => {
    const size = radius * 2;
    ctx.fillRect(-radius, -radius, size, size);
  },
};
