import { Particle } from "../classes/Particle";

/**
 * Defines a rectangular boundary for spatial partitioning.
 */
export class Boundary {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
  ) {}

  /**
   * Tests if a particle is within this boundary.
   * @param p The particle to test.
   * @returns True if the particle is within the boundary, otherwise false.
   */
  contains(p: Particle): boolean {
    return (
      p.x >= this.x &&
      p.x <= this.x + this.w &&
      p.y >= this.y &&
      p.y <= this.y + this.h
    );
  }

  /**
   * Tests if this boundary intersects with another boundary.
   * @param range The other boundary to test against.
   * @returns True if the boundaries intersect, otherwise false.
   */
  intersects(range: Boundary): boolean {
    return !(
      range.x > this.x + this.w ||
      range.x + range.w < this.x ||
      range.y > this.y + this.h ||
      range.y + range.h < this.y
    );
  }
}

/**
 * A QuadTree for efficient spatial partitioning of particles.
 */
export class QuadTree {
  private particles: Particle[] = [];
  private divided: boolean = false;
  private capacity: number = 4;

  // Sub-quadrants
  private northeast?: QuadTree;
  private northwest?: QuadTree;
  private southeast?: QuadTree;
  private southwest?: QuadTree;

  /** Creates an instance of QuadTree. */
  constructor(public boundary: Boundary) {}

  /**
   * Subdivides the current quadrant into four sub-quadrants.
   */
  private subdivide() {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2;
    const hh = h / 2;

    this.northwest = new QuadTree(new Boundary(x, y, hw, hh));
    this.northeast = new QuadTree(new Boundary(x + hw, y, hw, hh));
    this.southwest = new QuadTree(new Boundary(x, y + hh, hw, hh));
    this.southeast = new QuadTree(new Boundary(x + hw, y + hh, hw, hh));
    this.divided = true;
  }

  /**
   * Insert a particle into the QuadTree.
   * @param p The particle to insert.
   * @returns a boolean indicating if the insertion was successful.
   */
  insert(p: Particle): boolean {
    if (!this.boundary.contains(p)) return false; // Out of bounds

    // If there's space, add the particle here
    if (this.particles.length < this.capacity) {
      this.particles.push(p);
      return true;
    }

    // Otherwise, subdivide and try to insert into sub-quadrants
    if (!this.divided) this.subdivide();

    return (
      this.northwest!.insert(p) ||
      this.northeast!.insert(p) ||
      this.southwest!.insert(p) ||
      this.southeast!.insert(p)
    );
  }

  /**
   * Query the QuadTree for particles within a given range.
   * @param range The boundary to query.
   * @param found An array to store found particles.
   * @returns An array of particles found within the range.
   */
  query(range: Boundary, found: Particle[] = []): Particle[] {
    if (!this.boundary.intersects(range)) return found; // No intersection

    // Check particles at this level
    for (const p of this.particles) {
      if (range.contains(p)) found.push(p);
    }

    // If subdivided, query sub-quadrants recursively
    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }

    // Return found particles
    return found;
  }
}
