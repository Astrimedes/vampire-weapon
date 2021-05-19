import Dungeon from '../map/map.js';
import Renderer from './renderer.js';
import Player from '../weapons/player.js';
import Chump from '../creatures/chump.js';
import { Exit } from '../map/tile.js';
import { GameState, InputStates } from './gamestate.js';
import { Sprite } from '../../assets/sprite-index.js';
import Slime from '../creatures/slime.js';
import { Dialog } from '../ui/dialog.js';
import { levels } from '../config/levels.js';
import Spider from '../creatures/spider.js';
import { Rng } from '../tools/randoms.js';
import SlowGuy from '../creatures/slowguy.js';
import HeadsUpDisplay from './hud.js';
import { Actions, InputReader } from './inputReader.js';
import weaponTypes from '../config/weaponTypes.js';
import { allAbilities, getStartingAbilities } from '../abilities/all/index.js';
import { blinkSpecial } from '../creatures/specials/all/blink.js';
import { ArrayUtil } from '../tools/arrayutil.js';
import Fist from '../weapons/fist.js';
import { Particle } from '../map/particle.js';
import { gold, purple } from '../../assets/colors.js';
import Witch from '../creatures/witch.js';

const TILE_SIZE = 64;

const assets = {};

export default class Game {
  constructor() {
    this.unloadAssets();
    /**
     * @type {GameState} gameState
     */
    this.gameState = null;
    this.inputState = InputStates.None;
    this.turnCount = 0;

    // avoid re-creating function
    this.waitFunction = (e) => {
      e.preventDefault();
      if (this.gameState !== GameState.Play) {
        // count as 'button press'
        this.sendUserAction(Actions.ok);
        return;
      }
      this.wait();
    };

    this.charmFunction = e => {
      e.preventDefault();

      if (!this.player || this.player?.wielder?.dead || !this.gameState.hasMap) {
        return this.sendUserAction(Actions.ok);
      }

      const COST = 0;
      if ((this?.player?.wielder?.hp || 0) < COST + 1) {
        return this.callMessageDialog(`Curse costs ${COST} health!`);
      }
      this.player.wielder.hp -= COST;

      // charm fn
      const curseFn = (monster) => {
        // do charm
        let controlled = this.player.charm(monster);
        const count = 16;
        this.addSimpleParticles(count, monster.tile.x, monster.tile.y, purple);
        if (controlled) {
          this.charmMonster(monster);
          this.addSimpleParticles(count * 2, monster.tile.x, monster.tile.y, gold);
        }
        // tick
        this.tick();
      };
      let validateCreature = creature => creature && !creature.dead && !creature.isPlayer && creature.tile;

      // AUTO SELECT SINGLE CREATURE
      let creatures = this.map.getAdjacentNeighbors(this.player.tile).map(t => validateCreature(t.creature) ? t.creature : null).filter(c => c !== null);
      if (creatures.length == 1) {
        curseFn(creatures[0]);
        return;
      }

      // EXIT IF NO CREATURES
      if (!creatures.length) {
        return this.callMessageDialog('There are no creatures nearby to curse.');
      }

      // SELECT CREATURE
      this.setInputState(InputStates.Target);
      this.inputState.targetRange = 1;
      this.setTileAction((game, tile) => {
        // validate selection
        if (!validateCreature(tile.creature)) {
          return this.callMessageDialog('You must select a creature!');
        }
        // curse
        curseFn(tile.creature);
        // reset input state
        game.setInputState(InputStates.Move);
        game.resetInputActions();
      });
    };
  }

  setGameState (state) {
    if (state !== this.gameState) {
      this.lastGameState = this.gameState;
      this.gameState = state;
    }
    // set default input state
    this.setInputState(state.input);
    this.resetInputActions();
    return false;
  }

  setInputState(state) {
    if (this.inputState !== state) {
      this.inputState = state;
      this.resetInputActions();
      return true;
    }
    this.resetInputActions();
    return false;
  }

  /**
   *
   * @param {function(Game, (import('../map/tile').Tile)):void} callback
   */
  setTileAction(callback) {
    if (this.inputTile !== callback) {
      this.lastTileAction = this.inputTile;
      /**
       * @type {function(Game, Tile):boolean} inputTile callback
       */
      this.inputTile = callback;
    }
  }

  setCommandAction(callback) {
    if (this.inputCommand !== callback) {
      this.lastCommandAction = this.inputCommand;
      this.inputCommand = callback;
    }
  }

  resetInputActions() {
    this.inputState.reset();
    this.inputState.targetRange = 0;
    this.targetRangeTiles = null;
  }

  /**
   * Send an action from Actions enum (numbers)
   * @param {number} action - Actions.up, .down, etc
   */
  sendUserAction(action) {
    this.callInputCommand(action);
  }

  callInputCommand(action) {
    if (this.inputState !== InputStates.None) {
      this.inputState.commandAction(this, action);
    }
  }

  sendUserTileSelect(tile) {
    if (this.inputState !== InputStates.None) {
      // call input callback
      let result = !!this.inputState.tileAction(this, tile);
      if (result) {
        this.resetInputActions();
      }
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
    // just in case
    this.renderer.clearParticles();
  }

  setupMap (level = 1) {
    this.exitReached = false;
    this.level = level;
    this.map = new Dungeon();
    this.map.generateLevel(this.currentLevel.size, true);
    this.renderer.setSizes(TILE_SIZE, this.currentLevel.size);
    this.renderer.resize();
  }

  isInputAllowed() {
    const MAX_BLOCKING_TIME = 500;
    // check for override of input blocking
    if (this?.renderer?.animationsRunning && (this.time - this.lastInputAllowedTime) > MAX_BLOCKING_TIME) {
      this.renderer.resetCounts();
    }

    let blocked = !this.inputState || this.inputState == InputStates.None || this?.renderer?.animationsRunning;
    if (!blocked) this.lastInputAllowedTime = this.time;

    return !blocked;
  }

  setupInput() {
    if (!this.input) {
      this.input = new InputReader({
        doc: document,
        game: this,
        useKeyboard: true,
        usePointer: true
      });
    }
    this.lastInputAllowedTime = 0;
    this.input.setupInput();
  }

  wait() {
    if (this.inputState == InputStates.Move) {
      if (this?.player?.wielder?.stunned || this.monsters.length < 1) {
        this.tick();
        return;
      }

      this.hud.writeMessage('You defend.');

      this.player.wielder.defend();

      this.tick();
    }
  }

  setupPlayerFromConfig(weaponConfig) {
    this.weaponConfig = { ...weaponConfig };

    // unwield now so that maxHp adjustments work as expected
    let previousControlTurns = 0;
    let wielder = this?.player?.wielder;

    this.player.setFromTemplate(weaponConfig);

    // re-wield to apply changes
    if (wielder) {
      previousControlTurns = wielder.controlTurns;
      wielder.wield(this.player);
      wielder.controlTurns = previousControlTurns;
    }
  }

  setupPlayer(currentPlayer) {

    // *** Starting Tile *** guarantee starting position neighbors have no monsters and >= 3 passable tiles
    const maxtries = 100;
    let tries = 0;
    let tile;
    let success = false;
    while (tries < maxtries && !success) {
      tile = this.map.randomPassableTile();

      let neighbors = this.map.getAdjacentNeighbors(tile);
      let opencount = neighbors.filter(t => t.passable && !t.creature && !t.trapped).length;
      let monsterCount = neighbors.filter(t => t.creature).length;
      success = opencount >= 3 && monsterCount < 1;
      tries++;
    }
    if (!success) throw `Couldn't find valid player start tile in ${maxtries} tries`;


    // *** First time player create ***
    if (this.level == 1) {
      let playerConfig = {
        damage: (currentPlayer?.dmg || currentPlayer?.damage) || 1,
        speed: currentPlayer?.speed || 0,
        reach: currentPlayer?.reach || 1,
        parry: currentPlayer?.parry || 1,
        parryFrequency: currentPlayer?.parryFrequency || 4,
        spriteNumber: currentPlayer?.spriteNumber || Sprite.Weapon.sword,
        maxHp: currentPlayer?.maxHp || 0,
        currentHp: currentPlayer?.wielder?.hp ? (Math.max(currentPlayer.wielder.hp - (currentPlayer.maxHp || 0), 1)) : undefined,
        abilities: currentPlayer?.abilities || [],
        charmConfig: currentPlayer?.charmConfig || this?.weaponConfig?.charmConfig || weaponTypes[0]?.charmConfig || []
      };

      // create player
      this.player = new Player(this, this.map, playerConfig);
      // create player body
      let BodyCreature = currentPlayer?.wielder?.constructor || Chump;
      /**
     * @type {Creature}
     */
      let body = new BodyCreature(this, this.map, tile, new Fist(this, this.map), {
        beginAwake: true,
        currentHp: playerConfig.currentHp
      }); // will attach to playerBody

      // do charm on new body
      let charmed = false;
      while (!charmed) {
        charmed = this.player.charm(body);
      }
      this.charmMonster(body);

      body.controlTurns = 99;

      // *** EXIT EARLY ***
      return;
    }

    // *** Existing Player - change map ref on player and monster ***
    this.transferExistingPlayer(currentPlayer, tile);
  }

  transferExistingPlayer(player, tile) {
    this.player = player;

    // set tile first to prevent any issues with movement from old map
    player.map = this.map;
    player.tile = tile;
    player.x = tile.x;
    player.y = tile.y;

    let wielder = player.wielder;
    wielder.spawnTurn = 0;
    wielder.map = this.map;
    wielder.tile = tile;
    wielder.move(tile);
  }

  setupMonsters () {
    this.dead = [];
    this.corpses = [];
    /**
     * @type {Array<import('../creatures/creature.js').default>} all enemies
     */
    this.monsters = [];
    this.nextMonsters = [];

    let level, chumps, slimes, spiders, slowguys, witches;
    level = levels[this.level];
    if (level) {
      chumps = level.chumps || 0;
      slimes = level.slimes || 0;
      spiders = level.spiders || 0;
      slowguys = level.slowguys || 0;
      witches = level.witches || 0;
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

    for(let i = 0; i < witches; i++) {
      this.monsters.push(new Witch(this, this.map, this.map.randomPassableTile()));
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
    // add next monsters between ticks
    if (this?.nextMonsters?.length) {
      this.monsters = this.monsters.concat(this.nextMonsters);
      this.nextMonsters = [];
    }

    this.selectedTile = null;
    this.turnCount++;

    const dead = [];

    if (this.player.wielder.stunned) {
      this.hud.writeMessage('You were stunned.');
    }

    // reduce status effects, etc.
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

    // reduce status effects, etc.
    this?.player?.wielder?.tick();

    this.player.tryAct();

    let pbody = this?.player?.wielder;
    if (pbody && pbody.dead) {
      dead.push(pbody);
    }

    // dead are resolved
    dead.forEach(mon => {
      this.corpses.push(mon);
      mon.die();
    });

    this.updateHud();
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

  /**
   *
   * @param {import('../creatures/creature').default} monster
   */
  charmMonster(monster) {
    // check valid target
    let oldPBody = this?.player?.wielder;

    this.player.setWielder(monster);
    monster.wield(this.player);

    monster.control = 1;

    // add old body back to monsters
    if (oldPBody) {
      oldPBody.unWield();

      if (oldPBody.hp) {
        // make asleep after control
        // oldPBody.asleep = true;
        // add to ai processing
        this.addMonster(oldPBody);
      } else {
        // avoid gameover for newly dead old body?
        oldPBody.isPlayer = false;
        oldPBody.die();
        this.corpses.push(oldPBody);
      }
    }

    this.hud.writeMessage(`The CURSED ${monster.name} wields you!!!`);
  }

  beginGameLoop () {
    let draw;
    this.time = 0;

    draw = (elapsedTimeMs) => {

      if (this.exitReached && !this.renderer.animationsRunning) {
        this.loadLevel(this.level, this.player);
      }

      let msDiff = Math.min(1000, Math.max(elapsedTimeMs - this.time, 1));

      this.frameSpeed = Math.min(Math.max(msDiff / 1000.0, 0), 1);
      this.lastRenderTime = this.time;
      this.time = elapsedTimeMs;

      let stopAnimation = this.frameSpeed >= 0.9;

      // reset animationsRunning flag
      this.renderer.resetCounts();

      // cls
      this.renderer.clearScreen();

      // draw dungeon etc
      if (this.gameState.hasMap && this.loadComplete) {
        this.systemsUpdate();

        // draw map
        this.renderer.drawMap(this.map, this);

        // draw corpses
        this.corpses.forEach(corpse => {
          if (corpse.visible) {
            // this.renderer.drawSprite(Sprite.Feature.blood, corpse.x, corpse.y);
            this.renderer.drawCreature(corpse);
          }
        });

        // draw player
        this.renderer.drawTileOutline(this.player.tile.x, this.player.tile.y, 'orange'); // outline
        if (this.player.wielder) {
          this.renderer.drawCreature(this.player.wielder, !stopAnimation);
          stopAnimation && (this.player.stopAnimation() & this.player.wielder.stopAnimation());
        }

        // monsters
        this.monsters.forEach(mon => {
          if (mon.visible) {
            this.renderer.drawCreature(mon, !this.player.animating && !stopAnimation); // monsters animate after player?
          }
          stopAnimation || !mon.visible ? mon.stopAnimation() : null;
        });

        // draw highlighted tile
        if (this.selectedTile && this.gameState == GameState.Play) {
          this.renderer.drawTileRect(this.selectedTile.x, this.selectedTile.y, this.inputState.selectColor || 'green', 0.11);
        }

        // draw particles
        this.renderer.drawAllParticles(msDiff);

        // draw pause icon while input is blocked
        if (this.renderer.animationsRunning) {
          this.renderer.drawSpriteScaled(Sprite.Icon.stun, this.currentLevel.size - 1, this.currentLevel.size - 2, 2);
        }
      }

      if (this.gameState.dimmed) {
        this.renderer.dimOverlay();
      }

      if (this.inputState === InputStates.Target && this.inputState.targetRange) {
        if (!this.targetRangeTiles) {
          this.targetRangeTiles = this.map.getConnectedWithFilter(this?.player?.wielder?.tile, undefined, this.inputState.targetRange);
          // remove center tile (should always be 0 element) where player is standing
          this.targetRangeTiles.splice(0, 1);
        }
        this.renderer.drawTileRects(this.targetRangeTiles);
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
      if (this.frameSpeed < 0.9) return window.requestAnimationFrame(draw);

      // if we're delayed, delay calling next frame
      if (this.frameSpeed > 0.9) {
        setTimeout(() => {
          window.requestAnimationFrame(draw);
        }, 333);
        return;
      }
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

  callAbilityDialog() {
    // determine which abilities to offer - once per floor
    if (!this.abilities) {
      this.abilities = [];
    }
    const COUNT = 3;
    if (this.abilities.length < COUNT && allAbilities.length) {
      this.abilities = Rng.shuffle(allAbilities).filter((val, idx) => {
        return idx < COUNT;
      });
    }

    let text = this.abilities.length ? 'Choose an ability:' : 'No abilities';

    // update hud for blood total
    this.updateHud();

    // setup dialog
    let message = [text];
    let dlgSettings = {
      type: 'abilities',
      message,
      fields: this.abilities,
      submit: (data) => {
        let ability = this.abilities.find(a => a.name == data);
        if (ability) {
          if (ability.oneTime) {
            let idx = allAbilities.findIndex(a => a == ability);
            idx !== -1 && allAbilities.splice(idx, 1);
          }

          // hp cost
          this.player.wielder.hp -= ability.cost;

          // apply ability
          this.player.addAbility(ability);

          // ** now increase cost?
          ability.cost += Math.round(ability.cost / 2);

          // disable shop tile after purchase
          this?.player?.wielder?.tile?.deactivate();

          // update ui for new blood total etc
          this.updateHud(true);
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

  callWeaponSelectDialog() {
    this.loadComplete = false;
    this.hud.hide();

    // setup dialog
    let message = ['What kind of weapon are you?'];
    let dlgSettings = {
      type: 'prompt',
      message,
      fields: [{ label: 'Sword [Parry+]', value: 'sword' },
        { label: 'Axe [Damage+]', value: 'axe' },
        { label: 'Spear [Reach+]', value: 'spear' }],
      submit: (data) => {
        if (!data) return;
        this.setupPlayerFromConfig(weaponTypes.find(wt => wt.name == data));
        this.loadComplete = true;
        this.hud.reveal();
        this.setGameState(GameState.Play);
        this.updateHud(true);
      },
      player: this.player
    };
    this.callDialog(dlgSettings);
  }

  systemsUpdate() {
    // update hud
    if (this.gameState == GameState.Play && this.loadComplete) {
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
    let firstLevel = level == 1;
    this.turnCount = 0;

    let lastLevel = this.currentLevel;
    this.currentLevel = levels[level] || lastLevel;
    this.setGameState(GameState.Loading);

    // reset available abilities
    this.abilities = [];

    // find previous reference to player
    this.exitReached = false;
    this.exitSpawned = false;
    this.setupMap(level);
    this.setupMonsters();

    // call this before calling level select
    this.setupPlayer(player);

    if (firstLevel) {
      getStartingAbilities();

      this.hud.clearMessages();
      this.hud.writeMessage('You awaken from your magical slumber thirsty for blood!');

      // let player selection of weapon type set game state to PLAY
      this.callWeaponSelectDialog();
    } else {
      // set hud
      this.updateHud(true);

      // update state
      this.setGameState(GameState.Play);
      this.hud.writeMessage('You enter the portal, in search of more blood...');
    }

    // allow monsters to wake that start near the player
    this.monsters.forEach(m => {
      m.tryWake();
    });

    // small particle burst to show player where they are
    setTimeout(() => this.addSimpleParticles(24, this.player.tile.x, this.player.tile.y, gold), 150);

  }

  /**
   *
   * @param {*} count
   * @param {*} tileX
   * @param {*} tileY
   * @param {{r: number, g: number, b: number, a: number}} color
   * @param {boolean} isColorVaried
   * @param {*} offsetX
   * @param {*} offsetY
   */
  addSimpleParticles(count, tileX, tileY, color, isColorVaried = true, offsetX = 0, offsetY = 0) {
    const baseSpeed = this.renderer.tileSize / 4000;
    // add particles here
    for (let idx = 0; idx < count; idx++) {
      let xSpeed = Rng.anyIn(-1, 1) * Rng.inFloatRange(baseSpeed * 0.75, baseSpeed * 1.25);
      let ySpeed = Rng.anyIn(-1, 1) * Rng.inFloatRange(baseSpeed * 0.75, baseSpeed * 1.25);
      let life = Rng.inRange(250, 500);
      let size = Rng.inFloatRange(2, 5);

      // slight color variation per particle?
      color = { ...color };
      if (isColorVaried) {
        const variance = 15;
        ['r', 'g', 'b'].forEach(prop => {
          color[prop] = Math.min(255, Math.max(0, color[prop] + Rng.inRange(-variance, variance)));
        });
      }

      let config = {
        tilePos: { x: tileX, y: tileY },
        color: color,
        offset: { x: offsetX, y: offsetY },
        speed: { x: xSpeed, y: ySpeed },
        life,
        size
      };
      this.renderer.addParticle(new Particle(config));
    }
  }

  /**
   * Return string representation of an array of curse objects
   * @param {Array<{name: string, effect: function}>} curses
   * @returns string
   */
  parseCurses(curses) {
    return '\n' + ArrayUtil.unique(curses?.map((curse, index, array) => {
      return curse.name + ': ' + array.filter(c => c.name == curse.name).length;
    }))?.join('\n');
  }

  updateHud(clearAll) {
    if (!this.gameState.hasMap) {
      return;
    }

    if (clearAll) {
      this.hud.clearAllStatus();
    }

    let infoColor = 'gray';
    this.hud.setStatusField('Level', this.level, infoColor);
    // this.hud.setStatusField('Blood:', this?.player?.blood || 0, infoColor);
    this.hud.addEmptyStatus('section1');

    let dangerColor = 'yellow';

    // Derived Stats
    // - health
    let firstColor = 'darkgreen';
    let wielder = this?.player?.wielder;
    let hp = this.gameState == GameState.GameOver ? 0 : wielder?.hp || 0;
    let maxHp = hp ? wielder?.maxHp || 0 : 0;
    let fraction = maxHp > 0 ? hp / maxHp : 0;
    this.hud.setStatusField('HP', ` ${hp}/${maxHp}`, fraction > 0.5 ? firstColor : dangerColor);
    this.hud.addEmptyStatus('section2');

    // - attack
    let patk = this?.player?.dmg || 0;
    let str = this?.player?.wielder?.strength || 0;
    this.hud.setStatusField('Atk ', `${patk}${str >= 0 ? '+' : ''}${str}`, firstColor);
    // - parry
    // let parryCount = this?.player?.wielder?.canParry ? 0 : -Math.min(this.player.parryFrequency, this.player.parryFrequency - (this.turnCount - (this.player.lastParryTurn)));
    // let parryText = (parryCount >= 0 ? ('['+((this?.player?.parry || 0) + (this?.player?.wielder.agility || 0)))+']' : parryCount).toString();
    // let parryColor = parryCount >= 0 ? firstColor : dangerColor;
    // this.hud.setStatusField('Parry ', parryText, parryColor);
    // Weapon Stats
    // - maxHp
    this.hud.setStatusField('+MaxHP', this?.player?.maxHp, firstColor);

    this.hud.addEmptyStatus('section3');

    // wielder stats
    let secondColor = 'darkcyan';
    this.hud.setStatusField({ id: 'creature', label: '' }, this?.player?.wielder?.name || '', secondColor);
    let sign = num => num >= 0 ? '+' : '';
    let health = this?.player?.wielder?.origMaxHp || 0;
    this.hud.setStatusField('> HP ', sign(health) + health, secondColor);
    let atk = (this?.player?.wielder?.strength || 0);
    this.hud.setStatusField('> Atk', sign(atk) + atk, secondColor);
    // let par = (this?.player?.wielder?.agility || 0);
    // this.hud.setStatusField('> Par', sign(par) + par, secondColor);
    // curses - map unique values only
    // this.hud.addEmptyStatus('cursesSpace');
    // let curseString = this.parseCurses(this.player?.wielder?.curses || []);
    // this.hud.setStatusField('* Curses', curseString, secondColor);

    this.hud.addEmptyStatus('creatureSpace');
    // add wait button to hud
    if (clearAll || this.effectsUpdated) {
      this.hud.clearAllControl();

      // add wait button to hud
      this.hud.addControl('Defend', 0, this.waitFunction, '#71b238');

      // charm button - disable if just charmed monster
      this.hud.addControl('Charm', 0, this.charmFunction, 'blue');

      // Blink special move
      if (this.player.abilities.includes('Blink')) {
        this.hud.addControl('Blink', blinkSpecial.useCost, () => {
          if (this.gameState !== GameState.Play) {
            // count as 'button press'
            this.sendUserAction(Actions.ok);
            return;
          }
          // exit if we're not waiting for player moves during gameplay
          if (this.inputState !== InputStates.Move) return;
          // show dialog
          this.callDialog({
            message: 'Select a tile to Blink to',
            submit: () => {
              this.setGameState(this.lastGameState);

              this.setInputState(InputStates.Target);
              this.inputState.targetRange = blinkSpecial.range;

              this.setTileAction(blinkSpecial.tileInputAction);
            }
          });
        });
      }
      this.effectsUpdated = false;
    }

    this.hud.updateControls(this?.player?.wielder?.hp || 0);

    // disable curse conditionally
    let curseControl = this.hud.getControlElement('Curse');
    if (curseControl && this?.player?.dead === false) {
      const cooldown = 4;
      curseControl.disabled = (this?.player?.wielder?.controlTurns || 0) < cooldown;

      // re-focus here - keyboard focus seems to get stuck on disabled button
      curseControl.blur();
      curseControl.parentElement.parentElement.focus();
    }
  }

  initDom() {
    // create & hide hud
    this.hud = new HeadsUpDisplay(this, 'hud', 'hud-status', 'hud-controls', 'msg-display');

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
