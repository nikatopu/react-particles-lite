import { Particle } from "../classes/Particle";
import { QuadTree, Boundary } from "./QuadTree";

/**
 * Applies mouse hover interactions using spatial partitioning for performance.
 * @param qtree The QuadTree built for the current frame.
 */
export const applyInteractions = (
  qtree: QuadTree,
  mouse: { x: number; y: number; active: boolean },
  config: any,
  ctx: CanvasRenderingContext2D,
  allParticles: Particle[] // Needed for the "Bubble" reset logic
) => {
  const { onhover } = config.interactivity.events;
  const mode = onhover.mode;
  const modes = config.interactivity.modes;

  // The "Bubble" mode requires resetting all particles first
  if (mode === "bubble") {
    for (const p of allParticles) {
      p.radius = p.initialRadius;
      p.opacity = p.initialOpacity;
    }
  }

  // No interaction if mouse is inactive or hover is disabled
  if (!mouse.active || !onhover.enable) return;

  // Extract mouse position and mode distances
  const { x: mx, y: my } = mouse;
  const grabDist = modes.grab.distance;
  const bubbleDist = modes.bubble.distance;
  const repulseDist = modes.repulse.distance;

  // Determine the search area based on the active mode's distance
  let queryDist = 0;
  if (mode === "grab") queryDist = grabDist;
  else if (mode === "bubble") queryDist = bubbleDist;
  else if (mode === "repulse") queryDist = repulseDist;

  // Query only the particles within the mouse's area of influence
  const searchArea = new Boundary(
    mx - queryDist,
    my - queryDist,
    queryDist * 2,
    queryDist * 2
  );
  const neighbors = qtree.query(searchArea); // Particles near the mouse

  // Apply the interaction effects based on mode
  // This for loop processes only nearby particles for efficiency
  for (let i = 0, len = neighbors.length; i < len; i++) {
    const p = neighbors[i];
    const dx = p.x - mx;
    const dy = p.y - my;
    const distSq = dx * dx + dy * dy;
    const limitSq = queryDist * queryDist;

    // Only process if within the circular radius (QuadTree uses a square box)
    if (distSq < limitSq) {
      const dist = Math.sqrt(distSq);

      // If the mode is grab, draw a line between particle and mouse
      if (mode === "grab") {
        const opacity = 1 - dist / grabDist;
        ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }

      // If the mode is bubble, increase size and opacity
      if (mode === "bubble") {
        const ratio = 1 - dist / bubbleDist;
        p.radius =
          p.initialRadius + (modes.bubble.size - p.initialRadius) * ratio;
        if (modes.bubble.opacity) {
          p.opacity =
            p.initialOpacity +
            (modes.bubble.opacity - p.initialOpacity) * ratio;
        }
      }

      // If the mode is repulse, push particles away from mouse
      if (mode === "repulse") {
        const force = (repulseDist - dist) / repulseDist;
        const angle = Math.atan2(dy, dx);
        // Note: Movement is applied directly to position for immediate response
        p.x += Math.cos(angle) * force * 10;
        p.y += Math.sin(angle) * force * 10;
      }
    }
  }
};
