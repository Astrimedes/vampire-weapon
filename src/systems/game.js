import Dungeon from '../map/map.js';
import Renderer from './renderer.js';
import Player from '../weapons/player.js';
import Chump from '../creatures/chump.js';
import { Exit } from '../map/tile.js';
import { GameState } from './gamestate.js';
import { Sprite } from '../../assets/sprite-index.js';
import Slime from '../creatures/slime.js';
import { Dialog } from '../ui/dialog.js';
import { levels } from '../config/levels.js';
import Spider from '../creatures/spider.js';
import { Rng } from '../tools/randoms.js';
import SlowGuy from '../creatures/slowguy.js';
import { Abilities } from '../config/abilities.js';
import HeadsUpDisplay from './hud.js';
import { InputState } from './inputstate.js';

const TILE_SIZE = 16;
// const TILE_COUNT = 16;

const assets = {};

export default class Game {
  constructor () {
    this.unloadAssets();
    this.gameState = null;
    this.inputState = InputState.None;
    this.turnCount = 0;
  }

  setGameState (state) {
    if (state !== this.gameState) {
      this.lastGameState = this.gameState;
      this.gameState = state;
      // set default input state
      this.setInputState(state.input);
      return true;
    }
    return false;
  }

  setInputState(state) {
    if (this.inputState !== state) {
      this.inputState = state;
      this.inputAction = state.defaultAction;
      return true;
    }
    return false;
  }

  setInputAction(action) {
    this.inputAction = action;
  }

  resetInputAction() {
    this.setInputAction(this.inputState.defaultAction);
  }

  callInputActionForTarget(tile) {
    if (this.inputState !== InputState.None) {
      // call input callback
      this.inputAction(this, tile);
    }
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
      this.setupInput();
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
    let shop = this.level % 2 == 0;
    this.map.generateLevel(this.currentLevel.size, shop);
    this.renderer.setSizes(TILE_SIZE, this.currentLevel.size);
    this.renderer.resize();
  }

  checkInput () {
    // restart on button press after death
    if (!this.inputState || this.inputState == InputState.None || this?.renderer?.animationsRunning) return false;

    return true;
  }

  setupInput() {

    // keyboard - document listens
    const keyboardListen = (e) => {
      if (!this.checkInput() || !e.key) return;

      let tile = null;
      if (this?.gameState?.hasMap) {
        let dir = { x: 0, y: 0 };
        if (e.key == 'w') {
          dir.y = -1;
        } else if (e.key == 's') {
          dir.y = 1;
        } else if (e.key == 'a') {
          dir.x = -1;
        } else if (e.key == 'd') {
          dir.x = 1;
        } else if (e.key == ' ') {
          dir.wait = true;
        }
        if (this.inputState == InputState.Move && dir.wait) {
          this.wait();
          return true;
        }
        tile = this.map.getTile(this.player.x + dir.x, this.player.y + dir.y);
      }

      this.callInputActionForTarget(tile);
    };
    document.onkeydown = keyboardListen;

    // mouse events - canvas listens
    let canvas = document.querySelector('canvas');

    const mousedownListen = e => {
      e.preventDefault();
      if (!this.checkInput()) return;

      const tile = this.map ? this.renderer.getTileAt(e.clientX, e.clientY, this.map) : null;

      this.callInputActionForTarget(tile);
    };
    canvas.onmousedown = mousedownListen;

    const mousemoveListen = e => {
      if (!this.checkInput()) {
        this.highlightTile = null;
        return;
      }

      const tile = this.renderer.getTileAt(e.clientX, e.clientY, this.map);
      this.highlightTile = tile && this.map.inBounds(tile.x, tile.y) ? tile : null;
    };
    canvas.onmousemove = mousemoveListen;

    const mouseleaveListen = () => {
      this.highlightTile = null;
    };
    canvas.onmouseleave = mouseleaveListen;
  }

  wait() {
    if (this.inputState == InputState.Move) {
      if (this.player.wielder.stunned || this.monsters.length < 1) {
        this.tick();
        return;
      }

      this.hud.writeMessage('You wait.');

      if (this.player.blood > 0) {
        this.player.blood--;
        this.tick();
        return;
      }

      this.callMessageDialog('Not enough 💉');

    }
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
      blood: 5
    };
    if (currentPlayer) {
      playerConfig.reach = currentPlayer.reach;
      playerConfig.effects = currentPlayer.effects;
      playerConfig.blood = currentPlayer.blood;
    }

    // create player
    this.player = new Player(this, this.map, playerConfig);
    // create player body
    let BodyCreature = currentPlayer ? currentPlayer.wielder.constructor : Chump;
    let body = new BodyCreature(this, this.map, tile, this.player); // will attach to playerBody
    if (currentPlayer) {
      // copy over previous values
      body.hp = currentPlayer.wielder.hp;
    }

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
    this.highlightTile = null;
    this.turnCount++;

    const dead = [];

    if (this.player.wielder.stunned) {
      this.hud.writeMessage('You are stunned.');
    }

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
    let newBody = false;
    // take first monster and make new player body?
    if (dead.length) {
      this.charmMonster(dead[0]);

      // apply 1 turn stun
      if (!this.player.speed) {
        this.hud.writeMessage('You adjust to your new wielder...');
        this.player.wielder.stunned += 1;
      }
    }

    let pbody = this?.player?.wielder;
    if (pbody && pbody.dead) {
      dead.push(pbody);
      pbody.dieSilent = newBody; // last body dies without msg if we're jumping to another
    }

    // dead are resolved
    dead.forEach(mon => {
      this.corpses.push(mon);
      mon.die();
    });

    // check for all monsters dead - spawn exit
    // if (!this.monsters.length && !this.nextMonsters.length && !this.exitSpawned) {
    //   this.spawnExit();
    // }

    if (newBody) {
      // write to hud
      this.hud.writeMessage(`${this.player.wielder.name} is your new wielder!`);
      // message to indicate stun
      if (!this.player.speed) {
        this.hud.writeMessage('You adjust to your new wielder...');
      }
    }
  }

  spawnExit () {
    let tile = this.map.randomPassableTile();
    this.exitSpawned = true;
    // replace with Exit tile
    this.map.replaceTile(tile, Exit);
  }

  callDialog(settings) {
    if (this.dlg) {
      this.dlg.hide();
    }
    this.setGameState(GameState.Dialog);
    this.dlg = new Dialog(settings);
    this.dlg.reveal();
  }

  charmMonster(monster) {
    // check valid target
    let pbody = this?.player?.wielder;
    let tile = monster.tile;
    if (!pbody || !monster || monster?.isPlayer || !tile) return false;

    pbody.unWield();
    // mark current body dead...
    pbody.die(true);
    // this.dead.push(pbody);

    // create new playerBody
    let newBody = monster.createPlayerBody(this.player);
    // carefully swap tile references...
    tile.stepOn(newBody);
    tile.creature = newBody;
    newBody.tile = tile;

    // silently kill target, remove corpse
    monster.die(true);
    // remove from list
    let idx = this.monsters.findIndex(m => m == monster);
    if (idx > -1) {
      this.monsters.splice(idx, 1);
    }
    idx = this.dead.findIndex(d => d == monster);
    if (idx > -1) {
      this.dead.splice(idx, 1);
    }

    this.hud.writeMessage(`The charmed ${monster.name} wields you!`);
  }

  addAbility(ability) {
    this.player.blood -= Abilities.find(a => a.name == ability).getUpgradeCost(this.player);
    this.player.addEffect(ability);
    // force hud recalc
    this.effectsUpdated = true;

    let rank = this.player.effects.find(a => a.type == ability)?.value || (this.player.reach - 1);
    this.hud.writeMessage(`You learn ${ability} at Rank ${rank}!`);
  }

  beginGameLoop () {
    let draw;
    this.time = 0;
    draw = (elapsedTimeMs) => {
      // check for exit from level
      // if (this.exitReached && this.state !== GameState.Dialog) {
      //   // let animations finish
      //   if (!this.player.animating) {
      //     this.callAbilityDialog();
      //   }

      //   // call next rqaf before exiting
      //   window.requestAnimationFrame(draw);
      //   return;
      // }

      if (this.exitReached && !this.renderer.animationsRunning) {
        this.loadLevel(this.level, this.player);
      }

      this.frameSpeed = Math.min(Math.max((elapsedTimeMs - this.time) / 1000.0, 0.001), 1);
      this.lastRenderTime = this.time;
      this.time = elapsedTimeMs;

      // reset animationsRunning flag
      this.renderer.resetCounts();

      // cls
      this.renderer.clearScreen();

      // draw dungeon etc
      if (this.gameState.hasMap) {
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
        if (this.highlightTile && this.gameState == GameState.Play) {
          this.renderer.drawTileRect(this.highlightTile.x, this.highlightTile.y, 'blue', 0.11);
        }

        // draw pause icon while input is blocked
        if (this.renderer.animationsRunning) {
          this.renderer.drawSpriteScaled(Sprite.Icon.stun, this.currentLevel.size - 1, this.currentLevel.size - 2, 2);
        }
      }

      if (this.gameState.dimmed) {
        this.renderer.dimOverlay();
      }

      // draw title
      if (this.gameState == GameState.Title) {
        this.renderer.drawText('Vampire Weapon', 'red');
        this.renderer.drawText('Press any key to start', 'red', 6, null, Math.floor(this.renderer.canvas.height * 0.55));
      }

      // draw gameover state
      if (this.gameState == GameState.GameOver) {
        this.renderer.drawText('Game Over', 'red', 20);
        this.renderer.drawText('Press any key to try again', 'red', 6, null, Math.floor(this.renderer.canvas.height * 0.55));
      }

      // call next frame
      window.requestAnimationFrame(draw);
    };

    // start calling animations
    window.requestAnimationFrame(draw);
  }

  callMessageDialog(message, settings) {
    this.callDialog({
      type: 'prompt',
      message,
      fields: [],
      submit: () => { this.setGameState(this.lastGameState); },
      ...settings
    }
    );
  }

  callAbilityDialog(silent = false) {
    // determine which abilities to offer
    let available = Abilities.filter(a => a.getUpgradeCost(this.player) <= this.player.blood);
    if (!available.length) {
      if (!silent) {
        this.hud.writeMessage('Not enough blood.');
        this.callMessageDialog('Not enough 💉');
      }
      return false;
    }

    // setup dialog
    let message = ['Choose an ability:'];
    let dlgSettings = {
      type: 'abilities',
      message,
      fields: available,
      submit: (data) => {
        // add chosen ability
        this.addAbility(data);
        // update ui for new blood total etc
        this.updateHud(true);
        // try to call again
        let called = this.callAbilityDialog(true);
        if (!called) {
          this.setGameState(this.lastGameState);
        }
      },
      cancel: () => {
        this.setGameState(this.lastGameState);
      },
      player: this.player
    };
    this.callDialog(dlgSettings);

    return true;
  }

  systemsUpdate() {
    // add next monsters between ticks
    if (this.nextMonsters.length) {
      this.monsters = this.monsters.concat(this.nextMonsters);
      this.nextMonsters.length = 0;
    }
    // update hud
    if (this.gameState == GameState.Play) {
      this.updateHud();
    }
  }

  endGame() {
    if (this.dlg) {
      this.dlg.hide();
      this.dlg = null;
    }
    this.setGameState(GameState.GameOver);
  }

  exit () {
    this.level++;
    this.exitReached = true;
  }

  loadLevel(level = 1, player) {
    let lastLevel = this.currentLevel;
    this.currentLevel = levels[level] || lastLevel;
    this.setGameState(GameState.Loading);

    // find previous reference to player
    this.exitReached = false;
    this.exitSpawned = false;
    this.setupMap(level);
    this.setupMonsters();
    this.setupPlayer(player);

    // update state
    this.setGameState(GameState.Play);

    // set hud
    let clearAll = level == 1; // always clear on level 1
    this.updateHud(clearAll);
    if (clearAll) {
      this.hud.clearMessages();
      this.hud.writeMessage('You awaken from your magical slumber thirsty for blood!');
      this.hud.reveal();
    } else {
      this.hud.writeMessage('You enter the portal, in search of more blood...');
    }
  }

  updateHud(clearAll) {
    if (clearAll) {
      this.hud.clearAllStatus();
    }

    this.hud.setStatusField('🗺️', this.level);
    this.hud.setStatusField('💉', this.player.blood);
    this.hud.addEmptyStatus('empty1');
    if (clearAll || this.effectsUpdated) {
      this.player.effects.filter(e => e.type !== 'Player').forEach(e => {
        this.hud.setStatusField(e.type, e.value, true);
      });
      if (this.player.reach > 1) {
        this.hud.setStatusField('Size', this.player.reach - 1);
      }

      // add wait button to hud
      this.hud.addControl('⌛', (e) => {
        e.preventDefault();
        this.wait();
      }, 'red');

      this.effectsUpdated = false;
    }
  }

  initDom() {
    // create & hide hud
    this.hud = new HeadsUpDisplay('hud', 'hud-status', 'hud-controls', 'msg-display');

    this.hud.hide();
  }

  init() {
    this.initDom();

    this.setGameState(GameState.Loading);

    this.loadAssets();

    this.setupRendering(TILE_SIZE, levels[1].size);

    this.setupInput();

    this.setGameState(GameState.Title);
    this.beginGameLoop();
  }
}
