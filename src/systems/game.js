import Dungeon from '../map/map.js';
import Renderer from './renderer.js';
import Player from '../weapons/player.js';
import Chump from '../creatures/chump.js';
import { Exit } from '../map/tile.js';
import { State } from './gamestate.js';
import { Sprite } from '../../assets/sprite-index.js';
import Slime from '../creatures/slime.js';
import { Dialog } from './dialog.js';

const TILE_SIZE = 16;
const TILE_COUNT = 12;

const assets = {};

export default class Game {
  constructor () {
    this.unloadAssets();
    this.state = null;
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

  setupRendering (tileSize = TILE_SIZE, numTiles = TILE_COUNT) {
    this.tileSize = tileSize;
    this.numTiles = numTiles;
    // Create new renderer
    this.renderer = new Renderer(assets, tileSize, numTiles);

    window.onresize = () => {
      this.renderer.autoScale();
    };
  }

  setupMap (level = 1) {
    this.exitReached = false;
    this.level = level;
    this.map = new Dungeon();
    this.map.generateLevel(this.numTiles);
    // comment
  }

  checkInput () {
    // restart on button press after death
    if ((this.state == State.GameOver && !this.animationsRunning) || this.state == State.Title) {
      this.loadLevel(1);
      return false;
    }

    // block movement during animation / death / active dialog
    if (this.renderer.animationsRunning || this.player.dead || this.state == State.Dialog) return false;

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
      if (!this.checkInput()) return;

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
      if (!this.checkInput()) return;

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
        neighbors = this.map.getAdjacentPassableNeighbors(this.playerBody.tile);
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

      // finally move
      if (this.player.tryMove(x, y)) {
        this.tick();
      }
    }
    );
  }

  setupPlayer(playerConfig = {}) {
    // guarantee starting position neighbors have no monsters and >= 3 passable tiles
    const maxtries = 100;
    let tries = 0;
    let tile;
    let success = false;
    while (tries < maxtries && !success) {
      tile = this.map.randomPassableTile();
      let opencount = 0;
      this.map.getAdjacentNeighbors(tile).filter(t => !t.creature).forEach(t => {
        opencount += t.passable ? 1 : 0;
      });
      success = opencount >= 3;
      tries++;
    }
    if (!success) throw `Couldn't find valid player start tile in ${maxtries} tries`;

    this.player = new Player(this, this.map);
    // copy
    this.playerBody = new Slime(this, this.map, tile, this.player); // will attach to playerBody

    // copy over previous values
    this.playerBody.hp = playerConfig?.playerBody?.hp || 3;
    this.abilities = playerConfig?.abilities || [];
  }

  setupMonsters () {
    this.dead = [];
    this.corpses = [];
    this.monsters = [];
    this.nextMonsters = [];
    // let chumps = 1;

    // let level = levels[this.level];
    // if (level) {
    //   chumps = level.chumps || 0;
    // }

    // // chumps
    // for(let i = 0; i < chumps; i++) {
    this.monsters.push(new Chump(this, this.map, this.map.randomPassableTile()));
    // }
  }

  addMonster (creature) {
    this.nextMonsters.push(creature);
  }

  tick () {
    const dead = [];

    // monsters act
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const mon = this.monsters[i];

      if (!mon.dead) {
        mon.tryAct(this.player);
      } else {
        // add
        dead.push(mon);
        // remove
        this.monsters.splice(i, 1);
      }
    }

    // player acts - act() will always occur after all monsters have acted...
    this.player.tryAct();
    if (this.playerBody.dead) {
      dead.push(this.playerBody);
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
    let tile = this.playerBody.tile;
    let tries = 0;
    const limit = 1000;
    while (tries < limit && tile.creature) {
      tile = this.map.randomPassableTile();
      tries++;
    }
    if (!tile) throw 'Couldn\'t place exit tile...';
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
    this.abilities.push(ability);
  }

  beginGameLoop () {
    let draw;
    this.time = 0;
    draw = (elapsedTimeMs) => {
      // check for exit from level
      if (this.exitReached && this.state !== State.Dialog) {
        // let animations finish
        if (!this.player.animating) {
          let dlgSettings = {
            type: 'prompt',
            message: 'Choose an ability:',
            fields: [
              'Size', 'Bleed', 'Ice'
            ],
            submit: (data) => {
              console.log('submitted', data);
              // add chosen ability
              this.addAbility(data);
              // load next level (level already incremented)
              this.loadLevel(this.level, {
                playerBody: this.playerBody,
                player: this.player,
                abilities: this.abilities
              });
            }
          };
          this.callDialog(dlgSettings);
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
          this.renderer.drawCreature(corpse);
        });

        // draw player
        this.renderer.drawCreature(this.playerBody, true);

        // monsters
        this.monsters.forEach(mon => {
          this.renderer.drawCreature(mon, !this.player.animating); // monsters animate after player?
        });

        // draw level number
        this.renderer.drawText(`Level ${this.level}`, 'red', 8, 4, 8);
        // draw list of abilities
        this.abilities.forEach((a, i) => {
          this.renderer.drawText(a, 'red', 8, 4, 9 + ((i+1)*12));
        });

        // draw pause icon while input is blocked
        if (this.renderer.animationsRunning) {
          this.renderer.drawSpriteScaled(Sprite.Icon.stun, this.numTiles - 1, this.numTiles - 2, 2);
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

  loadLevel (level = 1, playerConfig) {
    this.setState(State.Loading);

    // find previous reference to player
    this.exitReached = false;
    this.exitSpawned = false;
    this.setupMap(level);
    this.setupMonsters();
    this.setupPlayer(playerConfig);

    // update state
    this.setState(State.Play);
  }

  init () {
    this.setState(State.Loading);

    this.loadAssets();

    this.setupRendering();

    this.setupInput();

    this.setState(State.Title);
    this.beginGameLoop();
  }
}
