import { Sprite } from '../../assets/sprite-index';
import { calcTrapTurns, getTrapByName } from '../config/traps';

const PI2 = Math.PI * 2;

export default class Renderer {
  constructor (assets, tileSize, numTiles) {
    this.setAssets(assets);

    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'low';

    this.tileSize = tileSize;
    this.numTiles = numTiles;

    /** @type {Array<import('../map/particle').Particle>} */
    this.particles = [];

    this.autoScale();
  }

  setSizes(tileSize, numTiles) {
    this.tileSize = tileSize;
    this.numTiles = numTiles;
  }

  autoScale() {
    let fullSize = ((this.tileSize * this.numTiles) / window.devicePixelRatio);
    let maxSize = 0.95 * (Math.min(window.innerWidth, window.innerHeight) / window.devicePixelRatio);
    let scale = maxSize / fullSize;

    this.setScale(scale, scale);
  }

  setScale(xScale, yScale) {
    if (this.scaleX !== xScale || this.scaleY !== yScale) {
      this.scaleX = xScale;
      this.scaleY = yScale;

      this.resize();
    }
  }

  resize() {
    const { canvas, tileSize, numTiles, scaleX, scaleY } = this;

    canvas.width = tileSize * numTiles * scaleX;
    canvas.height = tileSize * numTiles * scaleY;

    let styleWidth = `${canvas.width}px`;
    let styleHeight = `${canvas.height}px`;

    canvas.style.width = styleWidth;
    canvas.style.height = styleHeight;
  }

  setAssets (assets) {
    this.assets = assets;
  }

  clearScreen () {
    // clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  dimOverlay(alpha = 0.45) {
    this.ctx.save();
    this.ctx.fillStyle = `rgba(0,0,0,${alpha.toString()})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  tintOverlay(rgba, rect) {
    rgba = rgba || {
      r: 50, g: 50, b: 200, a: 0.45
    };
    this.ctx.save();
    this.ctx.fillStyle = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
    rect = rect || {
      x: 0, y: 0, w: this.canvas.width, h: this.canvas.height
    };
    this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.ctx.restore();
  }

  getDrawRect(xCenterTile, yCenterTile, halfWidth, halfHeight) {
    let tilesWide = 1 + (halfWidth * 2);
    let tilesHigh = 1 + (halfHeight * 2);
    let x = (xCenterTile - (tilesWide / 2) + 0.5) * this.tileSize * this.scaleX;
    let y = (yCenterTile - (tilesHigh / 2) + 0.5) * this.tileSize * this.scaleY;
    let w = tilesWide * this.tileSize * this.scaleX;
    let h = tilesHigh * this.tileSize * this.scaleY;
    return { x, y, w, h };
  }

  drawTileRect(x, y, color = 'blue', alpha = 0.5) {
    this.ctx.save();
    let xDraw = x * this.tileSize * this.scaleX;
    let yDraw = y * this.tileSize * this.scaleY;
    let sideX = this.tileSize * this.scaleX;
    let sideY = this.tileSize * this.scaleY;
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(xDraw, yDraw, sideX, sideY);
    this.ctx.restore();
  }

  /**
   *
   * @param {Array<{x: number, y: number}>} tileArray
   * @param {string|{r: number, g: number, b: number}} color
   * @param {number} alpha
   */
  drawTileRects(tileArray, color = 'blue', alpha = 0.5) {
    tileArray.forEach(t => {
      this.drawTileRect(t.x, t.y, color, alpha);
    });
  }

  drawTileOutline(x, y, color = 'darkgreen', alpha = 0.85, lineWidth = 4) {
    this.ctx.save();
    let xDraw = (x * this.tileSize * this.scaleX);
    let yDraw = (y * this.tileSize * this.scaleY);
    let sideX = (this.tileSize * this.scaleX);
    let sideY = (this.tileSize * this.scaleY);
    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(xDraw, yDraw, sideX, sideY);
    this.ctx.restore();
  }

  /**
   * @param {import('../map/particle').Particle} particle
   */
  addParticle(particle) {
    this.particles.push(particle);
  }

  removeParticle(particle) {
    let idx = this.particles.indexOf(particle);
    if (idx > -1) this.particles.splice(idx, 1);
  }

  drawAllParticles(renderTime) {
    this.ctx.save();

    // update, draw and filter particle list by active
    this.particles = this.particles.filter(p => this.drawParticle(p, renderTime));

    this.ctx.restore();
  }

  clearParticles() {
    this.particles = [];
  }

  /**
   * @param {number} renderTime
   * @param {import('../map/particle').Particle} particle
   */
  drawParticle(particle, renderTime) {
    // translate the point
    let point = this.getPixelForTile(particle.tilePos.x, particle.tilePos.y, false);
    point.x += particle.offset.x * this.scaleX;
    point.y += particle.offset.y * this.scaleY;

    // draw
    this.ctx.fillStyle = particle.fillStyle;
    // this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, particle.size * this.scaleX, 0, PI2);
    this.ctx.closePath();
    this.ctx.fill();

    // lifetime and position update
    return particle.update(renderTime);
  }

  drawText(text, color = 'yellow', size = 24, x = null, y = null) {
    this.ctx.save();

    this.ctx.fillStyle = color;
    size *= (this.scaleX + this.scaleY) / 2;
    this.ctx.font = size + 'px monospace';
    if(x === null || y === null) {
      let measured = this.ctx.measureText(text);
      x = x === null ? (this.canvas.width - measured.width)/2 : x;
      y = y === null ? (this.canvas.height - (size/4))/2 : y;
    }
    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }

  measureText(text, size) {
    this.ctx.save();
    this.ctx.font = size + 'px monospace';
    let result = this.ctx.measureText(text);
    this.ctx.restore();
    return result;
  }

  drawSprite (spriteNumber, x, y) {
    const { tileSize } = this;
    this.ctx.drawImage(this.assets.spritesheet, spriteNumber * tileSize, 0, tileSize, tileSize,
      x * tileSize * this.scaleX, y * tileSize * this.scaleY, tileSize * this.scaleX, tileSize * this.scaleY);
  }

  drawSpriteScaled(spriteNumber, x, y, scale = 1) {
    const { tileSize } = this;
    this.ctx.drawImage(this.assets.spritesheet, spriteNumber * tileSize, 0, tileSize, tileSize,
      x * tileSize * this.scaleX, y * tileSize * this.scaleY, tileSize * this.scaleX * scale, tileSize * this.scaleY * scale);
  }

  getTileAt(xPixel, yPixel, map) {
    if (!map) return;
    const { tileSize, scaleX, scaleY } = this;
    let rect = this.canvas.getBoundingClientRect();
    let x = Math.floor((xPixel - rect.left) / tileSize / scaleX);
    let y = Math.floor((yPixel - rect.top) / tileSize / scaleY);
    return map.getTile(x, y);
  }

  getPixelForTile(x, y, origin = true) {
    // origin (upper left)
    let point = { x: (x * this.tileSize * this.scaleX), y: (y * this.tileSize * this.scaleY) };
    if (origin) return point;

    // get center
    let hw = (this.tileSize * this.scaleX) / 2;
    point.x += hw;
    point.y += hw;
    return point;
  }

  /**
   * Draw a creature and associated icons etc
   * @param {import('../creatures/creature').default} creature
   * @param {boolean} animate
   */
  drawCreature(creature, animate = true) {
    // update animations each draw frame
    if (animate && !creature.dead) {
      this.animationsRunning = creature.animate() | creature?.weapon?.animate();
    }

    // weapon graphics
    let drawWeapon = creature.weapon && creature.weapon.drawSprite;
    if (drawWeapon) {
      // weapon draw order can depend on facing
      if (creature.lastMoveY < 0) {
        this.drawSprite(creature.weapon.spriteNumber, creature.weapon.getDisplayX(), creature.weapon.getDisplayY());
        this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
      } else {
        this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
        this.drawSprite(creature.weapon.spriteNumber, creature.weapon.getDisplayX(), creature.weapon.getDisplayY());
      }
    } else {
      this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
    }

    if (creature.dead) return;

    // draw weapon reach for living player
    if (creature.isPlayer && creature.hp) {
      for (let i = 1; i <= (creature?.weapon?.reach || 1); i++) {
        let tile = creature.map.getTile(creature.tile.x + (creature.lastMoveX * i), creature.tile.y + (creature.lastMoveY * i));
        if (!tile.passable && !tile.creature) break;
        this.drawTileRect(tile.x, tile.y, creature.weapon.drawColor, 0.08);
      }
    }

    // draw health & status effects if awake
    if (!creature.asleep) {

      // health
      let pos = this.getPixelForTile(creature.getDisplayX(), creature.getDisplayY());
      let height = this.tileSize * this.scaleY * 0.15;
      let fullWidth = this.tileSize * this.scaleX;
      let margin = 0.25;

      // hp meter
      this.drawMeter(pos.x + ((fullWidth * margin) / 2), pos.y,
        fullWidth * (1-margin), height,
        creature.hp || 0, creature.maxHp || 1);

      // curse/charm meter
      if (!creature.isPlayer) {
        let willpower = (1 - (creature.control || 0));
        this.drawMeter(pos.x + ((fullWidth * margin) / 2), pos.y + height * 1.2,
          fullWidth * (1-margin), height,
          willpower, 1, undefined, 'darkcyan');
      }

      // draw status effects
      let xAmt = 0.3;
      let x = creature.getDisplayX() + 0.5;
      let y = creature.getDisplayY() + 0.2;
      // if (creature.canParry && creature?.weapon?.parry) {
      //   this.drawSprite(Sprite.Icon.parry, x, y);
      //   x -= xAmt;
      // } else {
      //   this.drawSprite(Sprite.Icon.parryBroken, x, y);
      //   x -= xAmt;
      // }
      if (creature.isStunned()) {
        this.drawSprite(Sprite.Icon.stun, x, y);
        x -= xAmt;
      }
    } else {
      // sleeping
      this.drawSprite(Sprite.Icon.sleep, creature.getDisplayX(), creature.getDisplayY() - 0.2);
      // draw wake range?
      this.tintOverlay({ r: 83, g: 78, b: 37, a: 0.15 }, this.getDrawRect(creature.x, creature.y, creature.noticeRange, creature.noticeRange));
    }
  }

  drawMeter(x, y, width, height, amount, max, bgColor = '#AE0D7A', foreColor = '#559E54', borderColor = 'black') {
    this.ctx.save();

    // meter
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.fillStyle = foreColor;
    this.ctx.fillRect(x, y, width * (amount / max), height);

    // outline
    this.ctx.strokeStyle = borderColor;
    let lineWidth = Math.max(2, Math.min(width, height) / 12);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.restore();
  }

  resetCounts() {
    this.animationsRunning = false;
  }

  /**
   *
   * @param {import('../map/tile').Tile} tile
   */
  drawTile(tile, game) {
    // warning text we'll draw on top if present
    let warningText = '';

    // draw base tile
    this.drawSprite(tile.spriteNumber, tile.x, tile.y);

    // draw any traps
    let trap = tile.trapped ? getTrapByName(tile.trapType) : null;
    if (trap && trap.visible) {
      let turnUntilActive = calcTrapTurns(trap, tile, game);
      let active = turnUntilActive == 0;
      // draw
      this.drawSprite(active ? trap.spriteArmed : trap.spriteUnarmed, tile.x, tile.y);
      // draw trap count
      if (!active && turnUntilActive < Infinity) {0;
        warningText = turnUntilActive == 1 ? ' !!! ' : `(${turnUntilActive})`;
      }
    }

    // draw items
    tile.items.forEach(itm => {
      this.drawSprite(itm.spriteNumber, tile.x, tile.y);
    });


    if (warningText) {
      let pos = this.getPixelForTile(tile.x, tile.y + 0.6);
      this.drawText(warningText, 'red', undefined, pos.x, pos.y);
    }
  }

  drawMap(dungeon, game) {
    for(let i=0;i<dungeon.numTiles;i++){
      for(let j=0; j<dungeon.numTiles; j++){
        this.drawTile(dungeon.getTile(i,j), game);
      }
    }
  }
}
