import { Sprite } from '../../assets/sprite-index';

export default class Renderer {
  constructor (assets, tileSize, numTiles) {
    this.setAssets(assets);

    this.canvas = document.querySelector('canvas');
    const ctx = this.ctx = this.canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    this.tileSize = tileSize;
    this.numTiles = numTiles;

    this.autoScale();
  }

  setSizes(tileSize, numTiles) {
    this.tileSize = tileSize;
    this.numTiles = numTiles;
  }

  autoScale() {
    let fullSize = this.tileSize * this.numTiles;

    let windowSize = 0.9 * Math.min(window.innerWidth, window.innerHeight);
    let scale = Math.max(Math.floor(windowSize / fullSize) , 1);

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

    let dialog = document.getElementById('dialog');
    if (dialog) {
      dialog.style.width = styleWidth;
      dialog.style.height = styleHeight;
    }
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

  drawTileRect(x, y, color = 'red', alpha = 0.5) {
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

  drawText(text, color = 'yellow', size = 8, x = null, y = null) {
    this.ctx.save();

    this.ctx.fillStyle = color;
    size *= (this.scaleX + this.scaleY) / 2;
    this.ctx.font = size + 'px monospace';
    if(x === null || y === null) {
      let measured = this.ctx.measureText(text);
      x = x === null ? (this.canvas.width - measured.width)/2 : x;
      y = y === null ? (this.canvas.height - (size/4))/2 : y;
    } else {
      x *= this.scaleX;
      y *= this.scaleY;
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

  drawCreature(creature, animate = true) {
    // update animations each draw frame
    if (animate && !creature.dead) {
      this.animationsRunning = creature.animate() | creature?.weapon?.animate();
    }

    // no weapon
    if (!creature.weapon) {
      this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
      return;
    }

    // weapon drawing
    if (creature.lastMoveY < 0) {
      this.drawSprite(creature.weapon.spriteNumber, creature.weapon.getDisplayX(), creature.weapon.getDisplayY());
      this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
    } else {
      this.drawSprite(creature.spriteNumber, creature.getDisplayX(), creature.getDisplayY());
      this.drawSprite(creature.weapon.spriteNumber, creature.weapon.getDisplayX(), creature.weapon.getDisplayY());
    }

    // draw weapon reach
    for (let i = 1; i <= creature.weapon.reach; i++) {
      let tile = creature.map.getTile(creature.tile.x + (creature.lastMoveX * i), creature.tile.y + (creature.lastMoveY * i));
      if (!tile.passable && !tile.creature) break;
      this.drawTileRect(tile.x, tile.y, creature.weapon.drawColor, 0.08);
    }

    // draw health
    if (!creature.dead) {
      const size = (5 / 16);
      const row = 3;
      const height = 0.75;
      for (let i = 0; i < creature.hp; i++) {
        this.drawSprite(Sprite.Icon.hp, creature.getDisplayX() + (i % row) * size, creature.getDisplayY() - Math.floor(i / row) * size - height);
      }
    }

    // draw status effects
    let x = creature.getDisplayX() + 0.65;
    let y = creature.getDisplayY() + 0.2;
    if (creature.stunned) {
      this.drawSprite(Sprite.Icon.stun, x, y);
      x -= 0.25;
    }
    if (creature.ice > 0) {
      this.drawSprite(Sprite.Icon.ice, x, y);
      x -= 0.25;
      // x -= 0.65;
    }
    if (creature.fire > 0) {
      this.drawSprite(Sprite.Icon.fire, x, y);
      x -= 0.25;
      // x -= 0.65;
    }
    if (creature.bleed > 0) {
      this.drawSprite(Sprite.Icon.bleed, x, y);
      x -= 0.25;
      // x -= 0.65;
    }
  }

  resetCounts() {
    this.animationsRunning = false;
  }

  drawTile(tile) {
    this.drawSprite(tile.spriteNumber, tile.x, tile.y);
  }

  drawMap(dungeon) {
    for(let i=0;i<dungeon.numTiles;i++){
      for(let j=0; j<dungeon.numTiles; j++){
        this.drawTile(dungeon.getTile(i,j));
      }
    }
  }
}
