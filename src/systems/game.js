import Dungeon from '../map/map.js';
import Renderer from './renderer.js';
import Player from '../weapons/player.js';
import Chump from '../creatures/chump.js';
import { Exit } from '../map/tile.js';
import { State } from './gamestate.js';
import { Sprite } from '../../assets/sprite-index.js';
import Slime from '../creatures/slime.js';
import { Dialog } from './dialog.js';
import { levels } from '../config/levels.js';
import Spider from '../creatures/spider.js';
import { Rng } from '../tools/randoms.js';
import SlowGuy from '../creatures/slowguy.js';
import { abilities } from '../config/abilities.js';

const TILE_SIZE = 16;
// const TILE_COUNT = 16;

const assets = {};

export default class Game {
  constructor () {
    this.unloadAssets();
    this.state = null;
    this.turnCount = 0;
  }

  setState (state) {
    if (state !== this.state) {
      this.lastState = this.state;
      this.state = state;
      return true;
    }
    return false;
  }

  loadAssets (force = false) {
    if (force || !assets.spritesheet) {
      assets.spritesheet = new Image();
      assets.spritesheet.src = './spritesheet.png';
    }
  }

  unloadAssets () {
    Object.keys(assets).forEach((key) => {
      // just delete keys for now
      delete this.assets[key];
    });
  }

  setupRendering () {
    let  tileSize = TILE_SIZE;
    let numTiles = (this.currentLevel || levels[1]).size;
    // Create new renderer
    this.renderer = new Renderer(assets, tileSize, numTiles);

    window.onresize = () => {
      this.autoScale();
    };
  }

  autoScale() {
    this.renderer.setSizes(TILE_SIZE, this?.currentLevel?.size || levels[1].size);
    this.renderer.autoScale();
  }

  setupMap (level = 1) {
    this.exitReached = false;
    this.level = level;
    this.map = new Dungeon();
    this.map.generateLevel(this.currentLevel.size);
    this.renderer.setSizes(TILE_SIZE, this.currentLevel.size);
    this.renderer.resize();
  }

  checkInput (allowLoading = false) {
    // restart on button press after death
    if ((this.state == State.GameOver && !this.animationsRunning) || this.state == State.Title) {
      if (allowLoading) {
        this.loadLevel(1);
      }

      return false;
    }

    // block movement during animation / death / active dialog
    if (this.renderer.animationsRunning || !this.player || this.player.dead || this.state == State.Dialog) return false;

    // if stunned, advance by one tick on key press
    if (this.player.stunned) {
      this.tick();
      return false;
    }

    return true;
  }

  setupInput () {
    document.querySelector('html').onkeypress = (e) => {
      e.preventDefault();
      if (!this.checkInput(true)) return;

      let acted = false;
      if (e.key === 'w') acted = this.player.tryMove(0, -1);
      if (e.key === 's') acted = this.player.tryMove(0, 1);
      if (e.key === 'a') acted = this.player.tryMove(-1, 0);
      if (e.key === 'd') acted = this.player.tryMove(1, 0);

      if (acted) {
        this.tick();
      }
    };

    document.querySelector('html').addEventListener('mousedown', e => {
      e.preventDefault();
      if (!this.checkInput(true)) return;

      const tile = this.renderer.getTileAt(e.clientX, e.clientY, this.map);
      if (!tile) return;

      // raw distance
      const xDist = tile.x - this.player.x;
      const yDist = tile.y - this.player.y;

      // raw direction
      let x = Math.sign(xDist);
      let y = Math.sign(yDist);

      // flag
      let solved = false;
      let neighbors;

      if (x != 0 && y != 0) {
        // if both directions indicated, check adjacent tiles, select a passable one
        neighbors = this.map.getAdjacentPassableNeighbors(this?.player?.wielder?.tile);
        const xDest = this.player.x + x;
        const yDest = this.player.y + y;
        neighbors.filter(t => (t.x == xDest || t.y == yDest));
        if (neighbors.length) {
          let idx = 0;
          // if we've chosen a 'diagonal' move...
          if (neighbors[idx].x == xDest && neighbors[idx].y == yDest) {
            if (neighbors.length > 1) {
              idx++;
            } else {
              idx = -1;
            }
          }
          if (idx != -1) {
            x = neighbors[idx].x == xDest ? x : 0;
            y = neighbors[idx].y == yDest ? y : 0;
            solved = true;
          }
        }
      }

      if (!solved) {
        // choose the longer distance
        x = Math.abs(xDist) >= Math.abs(yDist) ? x : 0;
        y = x == 0 ? y : 0;
      }

      if (x == 0 && y == 0) return;

      // finally move
      if (this.player.tryMove(x, y)) {
        this.tick();
      }
    });

    document.querySelector('html').addEventListener('mousemove', e => {
      if (!this.checkInput(false)) return; // don't allow mousemove to start game

      this.highlightTile = null;

      const tile = this.renderer.getTileAt(e.clientX, e.clientY, this.map);
      if (!tile) return;

      if (tile == this.player.tile || !this.map.inBounds(tile.x, tile.y)) {
        return;
      }

      this.highlightTile = tile;
    });

    document.querySelector('html').addEventListener('mouseleave', () => {
      this.highlightTile = null;
    });
  }

  setupPlayer(currentPlayer) {
    // guarantee starting position neighbors have no monsters and >= 3 passable tiles
    const maxtries = 100;
    let tries = 0;
    let tile;
    let success = false;
    while (tries < maxtries && !success) {
      tile = this.map.randomPassableTile();

      let neighbors = this.map.getAdjacentNeighbors(tile);
      let opencount = neighbors.filter(t => t.passable && !t.creature).length;
      let monsterCount = neighbors.filter(t => t.creature).length;
      success = opencount >= 3 && monsterCount < 1;
      tries++;
    }
    if (!success) throw `Couldn't find valid player start tile in ${maxtries} tries`;

    let playerConfig = {
      reach: 1,
      effects: [],
      blood: 3
    };
    if (currentPlayer) {
      playerConfig.reach = currentPlayer.reach;
      playerConfig.effects = currentPlayer.effects;
      playerConfig.blood = currentPlayer.blood;
    }

    // create player
    this.player = new Player(this, this.map, playerConfig);
    // create player body
    let BodyCreature = currentPlayer ? currentPlayer.wielder.constructor : Slime;
    let body = new BodyCreature(this, this.map, tile, this.player); // will attach to playerBody
    // copy over previous values
    body.hp = Math.max(currentPlayer ? currentPlayer.wielder.hp : 0, 1);
  }

  setupMonsters () {
    this.dead = [];
    this.corpses = [];
    this.monsters = [];
    this.nextMonsters = [];

    let level, chumps, slimes, spiders, slowguys;
    level = levels[this.level];
    if (level) {
      chumps = level.chumps || 0;
      slimes = level.slimes || 0;
      spiders = level.spiders || 0;
      slowguys = level.slowguys || 0;
    } else {
      chumps = Rng.inRange(1, 3);
      slimes = Rng.inRange(1, 3);
      spiders = Rng.inRange(1, 3);
      slowguys = Rng.inRange(1, 3);
    }

    for(let i = 0; i < chumps; i++) {
      this.monsters.push(new Chump(this, this.map, this.map.randomPassableTile()));
    }

    for(let i = 0; i < slimes; i++) {
      this.monsters.push(new Slime(this, this.map, this.map.randomPassableTile()));
    }

    for(let i = 0; i < slowguys; i++) {
      this.monsters.push(new SlowGuy(this, this.map, this.map.randomPassableTile()));
    }

    // spiders - choose corners to begin
    let walls = [ 0, this.map.numTiles - 1];
    for(let i = 0; i < spiders; i++) {
      this.monsters.push(new Spider(this, this.map, this.map.getTile(Rng.any(walls), Rng.any(walls))));
    }
  }

  addMonster (creature) {
    this.nextMonsters.push(creature);
  }

  tick() {
    this.turnCount++;

    const dead = [];

    // reduce status effects, etc.
    this?.player?.wielder?.tick();
    this.monsters.forEach(m => m.tick());

    // monsters act
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const mon = this.monsters[i];

      // update statuses, do AI, etc
      mon.tryAct(this.player);
      if (mon.dead) {
        // add
        dead.push(mon);
        // remove
        this.monsters.splice(i, 1);
      }
    }

    this.player.tryAct();
    // take first monster and make new player body?
    if (dead.length) {
      let pbody = this?.player?.wielder;
      pbody.unWield();
      // mark current body dead...
      pbody.dead = true;
      dead.push(pbody);
      // create new playerBody
      dead[0].createPlayerBody(this.player);
      // remove killed enemy from dead
      dead[0].die();
      dead.splice(0, 1);
    }

    let pbody = this?.player?.wielder;
    if (pbody && pbody.dead) {
      dead.push(pbody);
    }

    // dead are resolved
    dead.forEach(mon => {
      this.corpses.push(mon);
      mon.die();
      // clean up if creature hasn't
      if (mon?.tile?.creature == mon) mon.tile.creature = null;
    });

    // check for all monsters dead - spawn exit
    if (!this.monsters.length && !this.nextMonsters.length && !this.exitSpawned) {
      this.spawnExit();
    }
  }

  spawnExit () {
    let tile = this.map.randomPassableTile();
    this.exitSpawned = true;
    // replace with Exit tile
    this.map.replaceTile(tile, Exit);
  }

  callDialog(settings) {
    this.dlg = new Dialog(settings);
    this.setState(State.Dialog);
    this.dlg.reveal();
  }

  addAbility(ability) {
    this.player.addEffect(ability);
    this.player.blood -= abilities.find(a => a.name == ability).cost;
  }

  beginGameLoop () {
    let draw;
    this.time = 0;
    draw = (elapsedTimeMs) => {
      // check for exit from level
      if (this.exitReached && this.state !== State.Dialog) {
        // let animations finish
        if (!this.player.animating) {
          this.callAbilityDialog();
        }

        // call next rqaf before exiting
        window.requestAnimationFrame(draw);
        return;
      }

      this.frameSpeed = Math.min(Math.max((elapsedTimeMs - this.time) / 1000.0, 0.001), 1);
      this.lastRenderTime = this.time;
      this.time = elapsedTimeMs;

      // reset animationsRunning flag
      this.renderer.resetCounts();

      // cls
      this.renderer.clearScreen();

      // draw title
      if (this.state == State.Title) {
        this.renderer.dimOverlay();
        this.renderer.drawText('Vampire Weapon', 'red');
        this.renderer.drawText('Press any key to start', 'red', 6, null, Math.floor(this.renderer.canvas.height * 0.55));
      }

      // draw dungeon etc
      if (this.state.hasMap) {
        this.systemsUpdate();

        // draw map
        this.renderer.drawMap(this.map);

        // draw corpses
        this.corpses.forEach(corpse => {
          // this.renderer.drawSprite(Sprite.Feature.blood, corpse.x, corpse.y);
          this.renderer.drawCreature(corpse);
        });

        // draw player
        this.renderer.drawTileRect(this.player.tile.x, this.player.tile.y, 'steelblue', 0.4); // outline
        if (this.player.wielder) {
          this.renderer.drawCreature(this.player.wielder, true);
        }

        // monsters
        this.monsters.forEach(mon => {
          this.renderer.drawCreature(mon, !this.player.animating); // monsters animate after player?
        });

        // draw highlighted tile
        if (this.highlightTile && this.state == State.Play) {
          this.renderer.drawTileRect(this.highlightTile.x, this.highlightTile.y, 'blue', 0.11);
        }

        // draw level number
        let x = 4;
        let y = 8;
        let height = 12;
        this.renderer.drawText(`Level: ${this.level}`, 'red', 8, x, y);
        y += height;
        this.renderer.drawText(`Blood: ${this?.player?.blood}`, 'red', 8, x, y);
        y += height;
        // draw list of abilities
        this.player.effects.forEach(a => {
          let text = a.type;
          if (a.value > 1) {
            text += ' x' + a.value;
          }
          y += 12;
          this.renderer.drawText(text, 'red', 8, x, y);
        });


        // draw pause icon while input is blocked
        if (this.renderer.animationsRunning) {
          this.renderer.drawSpriteScaled(Sprite.Icon.stun, this.currentLevel.size - 1, this.currentLevel.size - 2, 2);
        }

        if (this.state.dimmed) {
          this.renderer.dimOverlay();
        }

        // draw gameover state
        if (this.state == State.GameOver) {
          this.renderer.drawText('Game Over', 'red', 20);
          this.renderer.drawText('Press any key to try again', 'red', 6, null, Math.floor(this.renderer.canvas.height * 0.55));
        }
      }

      // call next frame
      window.requestAnimationFrame(draw);
    };

    // start calling animations
    window.requestAnimationFrame(draw);
  }

  callAbilityDialog() {
    // determine which abilities to offer
    let fields = abilities.filter(a => a.cost <= this.player.blood).map(a => a.name);
    const nextLevel = () => {
      this.loadLevel(this.level, this.player);
    };

    if (fields.length) {
      // setup dialog
      let dlgSettings = {
        type: 'prompt',
        message: 'Choose an ability:',
        fields: fields,
        submit: (data) => {
          // add chosen ability
          this.addAbility(data);
          nextLevel();
        },
        cancel: () => {
          nextLevel();
        }
      };
      this.callDialog(dlgSettings);
    } else {
      nextLevel();
    }
  }

  systemsUpdate() {
    // add next monsters between ticks
    if (this.nextMonsters.length) {
      this.monsters = this.monsters.concat(this.nextMonsters);
      this.nextMonsters.length = 0;
    }

    // check dialog status
    if (this.state == State.Dialog) {
      let off = !this.dlg || !this.dlg.open;
      if (off) {
        this.dlg = null;
        this.setState(this.lastState !== State.Dialog ? this.lastState : State.Play);
      }

    }
  }

  endGame () {
    this.setState(State.GameOver);
  }

  exit () {
    this.level++;
    this.exitReached = true;
  }

  loadLevel(level = 1, player) {
    let lastLevel = this.currentLevel;
    this.currentLevel = levels[level] || lastLevel;
    this.setState(State.Loading);

    // find previous reference to player
    this.exitReached = false;
    this.exitSpawned = false;
    this.setupMap(level);
    this.setupMonsters();
    this.setupPlayer(player);

    // update state
    this.setState(State.Play);
  }

  init () {
    this.setState(State.Loading);

    this.loadAssets();

    this.setupRendering(TILE_SIZE, levels[1].size);

    this.setupInput();

    this.setState(State.Title);
    this.beginGameLoop();
  }
}
