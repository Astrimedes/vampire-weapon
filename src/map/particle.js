import { lerp } from '../tools/mathutil';
/**
 * @param {{r: number, g: number, b: number, a: number}} color
 * @returns {string} rgba fill style string
 */
function createFillStyle(color) {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

class Particle {
  /**
   * @param {object} config
   * @param {{x: number, y: number}} config.tilePos tile's x and y indices object (not a Tile object)
   * @param {{x: number, y: number}} config.offset offset from center of tile in tile pixels (can cross into other tiles visually)
   * @param {{x: number, y: number}} config.speed speed in tile pixels per second
   * @param {{r: number, g: number, b: number, a: number}} config.color color object
   * @param {number} config.size radius of circle in unscaled tile pixels
   * @param {number} config.life lifetime in milliseconds
   *
   */
  constructor(config) {
    this.life = config.life || 0; // we'll subtract from this
    this.maxLife = this.life;
    this.tilePos = config.tilePos;
    this.offset = config.offset || { x: 0, y: 0 };
    this.speed = config.speed || {x: 0, y: 0};

    this.size = config.size || 1;
    this.life = config.life || 0;

    this.rgba = { r: null, g: null, b: null, a: null };
    this.setColor(config.color);

    this.active = true;
  }

  /**
   *
   * @param {{r: number, g: number, b: number, a: number}} color color object
   */
  setColor(color) {
    if (this.rgba.r == color.r && this.rgba.g == color.g && this.rgba.b == color.b && this.rgba.a == color.a) return;
    this.rgba.r = color.r;
    this.rgba.g = color.g;
    this.rgba.b = color.b;
    this.rgba.a = color.a;

    this.fillStyle = createFillStyle(this.rgba);
  }

  update(updateTime) {
    // position
    let gainX = updateTime * this.speed.x;
    let gainY = updateTime * this.speed.y;
    this.offset.x = lerp( this.offset.x, this.offset.x + gainX, 0.9);
    this.offset.y = lerp( this.offset.y, this.offset.y + gainY, 0.9);

    // lifetime
    this.life -= Math.max(1, updateTime);
    this.active = this.active && this.life > 0;

    // adjust alpha
    this.setColor({ ...this.rgba, a: lerp(this.rgba.a, 1, this.life / this.maxLife) });

    return this.active;
  }
}

export { Particle };
