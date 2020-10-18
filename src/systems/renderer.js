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
    const { tileSize, scaleX, scaleY } = this;
    let rect = this.canvas.getBoundingClientRect();
    let x = Math.floor((xPixel - rect.left) / tileSize / scaleX);
    let y = Math.floor((yPixel - rect.top) / tileSize / scaleY);
    return map.getTile(x, y);
  }

  drawCreature(creature, animate = true) {
    // update animations each draw frame
    if (animate) {
      this.animationsRunning = creature.animate() | creature?.weapon?.animate();
    }

    // creature & weapon
    if (creature.weapon) {
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

    // draw health
    if (!creature.dead) {
      const size = (5/16);
      const row = 3;
      const height = 0.75;
      for(let i = 0; i < creature.hp; i++) {
        this.drawSprite(Sprite.Icon.hp, creature.getDisplayX() + (i%row) * size, creature.getDisplayY() - Math.floor(i/row) * size - height);
      }
    }

    // draw status effects
    if (creature.stunned) {
      const x = 0.65;
      const height = 0;
      this.drawSprite(Sprite.Icon.stun, creature.getDisplayX() + x, creature.getDisplayY() - height);
    } else if (creature.angry) {
      const x = 0.65;
      const height = 0;
      this.drawSprite(Sprite.Icon.angry, creature.getDisplayX() + x, creature.getDisplayY() - height);
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
