// XorShift128, same generator and seeding as utils/rng.rs in the poster code,
// so seeds give the same glitches as the printed graphics.
export class XorShift128 {
  private x = new Uint32Array(4);

  constructor(seed: number) {
    this.x[0] = seed >>> 0;
    for (let i = 1; i < 4; i++) {
      this.x[i] = Math.imul(this.x[i - 1], 1812433253) ^ (this.x[i - 1] >>> 30);
    }
  }

  next(): number {
    const x = this.x;
    const t = x[0] ^ (x[0] << 11);
    x[0] = x[1];
    x[1] = x[2];
    x[2] = x[3];
    x[3] = x[3] ^ (x[3] >>> 19) ^ t ^ (t >>> 8);
    return x[3];
  }

  /** Uniform float in [0, 1). */
  float(): number {
    return this.next() / 4294967296;
  }

  /** Uniform integer in [0, n). */
  int(n: number): number {
    return this.next() % n;
  }

  range(min: number, max: number): number {
    return min + this.float() * (max - min);
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(items.length)];
  }
}
