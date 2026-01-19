import { Particle } from "../classes/Particle";
import { QuadTree, Boundary } from "./QuadTree";

/**
 * Mapping of movement directions to velocity components.
 * Used to set initial velocities based on direction strings.
 */
export const DIRECTION_MAP: Record<string, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  "top-left": { x: -1, y: -1 },
  "top-right": { x: 1, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  "bottom-left": { x: -1, y: 1 },
  "bottom-right": { x: 1, y: 1 },
  left: { x: -1, y: 0 },
  none: { x: 1, y: 1 },
};

/**
 * What happens when a particle goes out of bounds.
 * @param particle The particle to handle.
 * @param canvas The canvas the particle is on.
 */
export const handleOutMode = (
  particle: Particle,
  canvas: HTMLCanvasElement,
) => {
  const { move } = particle.getParameters(); // Get movement parameters
  const { width, height } = canvas; // Canvas dimensions
  const r = particle.radius; // Particle radius

  // Determine the wrapping dimensions used for "out" mode
  const wrapWidth = width + r * 2;
  const wrapHeight = height + r * 2;

  if (move.out_mode === "bounce") {
    // If the mode is bounce, reverse velocity on collision
    // We use overlap correction so that the particle doesn't get stuck
    // Additionally, this ensures that the particle reverses when it's edge hits the wall, not the center

    if (particle.x - r <= 0 && particle.vx < 0) {
      const overlap = -(particle.x - r);
      particle.vx *= -1;
      particle.x = r + overlap;
    } else if (particle.x + r >= width && particle.vx > 0) {
      const overlap = particle.x + r - width;
      particle.vx *= -1;
      particle.x = width - r - overlap;
    }

    if (particle.y - r <= 0 && particle.vy < 0) {
      const overlap = -(particle.y - r);
      particle.vy *= -1;
      particle.y = r + overlap;
    } else if (particle.y + r >= height && particle.vy > 0) {
      const overlap = particle.y + r - height;
      particle.vy *= -1;
      particle.y = height - r - overlap;
    }
  } else {
    // If the out mode is "out", wrap the particle to the opposite side
    // We consider the radius so that the particle fully exits before reappearing
    // Additionally, we use the offset of the particle to avoid stuttering when re-entering

    if (particle.x + r < 0) {
      particle.x += wrapWidth;
    } else if (particle.x - r > width) {
      particle.x -= wrapWidth;
    }

    if (particle.y + r < 0) {
      particle.y += wrapHeight;
    } else if (particle.y - r > height) {
      particle.y -= wrapHeight;
    }
  }
};

/**
 * Optimized Attraction using Spatial Partitioning.
 * Instead of checking every particle against every other,
 * we only check particles within a relevant local range.
 */
export const applyAttraction = (
  particles: Particle[],
  config: any,
  qtree: QuadTree
) => {
  const { attract } = config.move;
  if (!attract.enable) return; // No attraction if disabled

  // Precompute rotation factors and range
  const rotX = attract.rotateX * 1000;
  const rotY = attract.rotateY * 1000;
  const rangeRadius = 200;

  // For each particle, query nearby particles and apply attraction
  for (const p1 of particles) {
    // Define the query range around p1
    const range = new Boundary(
      p1.x - rangeRadius,
      p1.y - rangeRadius,
      rangeRadius * 2,
      rangeRadius * 2
    );
    const neighbors = qtree.query(range); // Nearby particles

    // Apply attraction from each neighbor
    for (const p2 of neighbors) {
      if (p1 === p2) continue;
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;

      // Calculate distance check if you want a circular attraction field
      // Otherwise, the square boundary from the query is used for performance.
      p1.vx -= dx / rotX;
      p1.vy -= dy / rotY;
    }
  }
};
