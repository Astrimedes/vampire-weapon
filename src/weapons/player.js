import { GameState } from '../systems/gamestate.js';
import { Actions } from '../systems/inputReader.js';
import { lerp, easeOut, easeIn } from '../tools/mathutil.js';
import { Rng } from '../tools/randoms.js';
import Weapon from './weapon.js';

export default class Player extends Weapon {
  /**
     *
     * @param {Game} game
     * @param {Dungeon} map
     * @param {{reach: number}} playerConfig
     */
  constructor(game, map, playerConfig = {}) {
    let wpnOptions = {
      drawSprite: true,
      ...playerConfig
    };
    super(game, map, wpnOptions, true);
    this.isPlayer = true;

    this.blood = playerConfig.blood || 0;
    this.speed = playerConfig.speed || 0;
    this.charmConfig = { ...wpnOptions.charmConfig };

    // array of names of abilities player has chosen
    this.abilities = Array.from(playerConfig?.abilities?.length ? playerConfig.abilities : []);
  }

  setFromTemplate(weaponType) {
    super.setFromTemplate(weaponType);

    this.charmConfig = { ...weaponType.charmConfig };
  }

  /**
   *
   * @param {import('../creatures/abilities/ability').Ability} ability
   */
  addAbility(ability) {
    this.abilities.push(ability.name);
    ability.applyAbility(this.game, this);
  }

  tryMove(dx, dy) {
    if (this?.wielder?.dead || this.dead) {
      if (this.game.gameState !== GameState.GameOver) {
        this.game.endGame();
        return;
      }
      return this.game.sendUserAction(Actions.ok);
    }
    if (this?.wielder?.stunned) return true;
    return this.wielder.tryMove(dx, dy);
  }

  attack(creature, dx, dy) {
    super.attack(creature, dx, dy);
    creature.playerHit = 2;
  }

  /**
   *
   * @param {import('../creatures/creature').default} creature
   */
  charm(creature) {
    // pick a curse
    let curse = Rng.any(this.charmConfig.curses);
    const charmHit = { curse, power: this.charmConfig.power };
    let charmed = creature.charm(charmHit);

    this.game.hud.writeMessage(`You CURSE the ${creature.name}...`);

    return charmed;
  }

  die() {
    this.stopAnimation();
    this.game.endGame();
    console.log('player died and called game.endGame()');
  }

  beginAnimation(xTarget, yTarget, interp = (t) => easeOut(easeIn(t)), duration = 150) {
    this.animating = true;
    this.offsetX = this.x - xTarget;
    this.offsetY = this.y - yTarget;
    // set this for proper first frame logic
    this.animStart = null;
    this.animDuration = duration;
    this.animInterp = interp;
  }

  stopAnimation() {
    this.animating = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.animStart = null;
    this.animDuration = 0;
  }

  animate() {
    if (!this.animating) return false;

    // first frame
    if (this.animStart == null) {
      this.animStart = this.game.time;
    }

    // elapsed animation time
    let animTime = this.game.time - this.animStart;
    let fraction = animTime / this.animDuration;
    this.offsetX =  lerp(this.offsetX, 0, this.animInterp(fraction));
    this.offsetY =  lerp(this.offsetY, 0, this.animInterp(fraction));

    let min = 0.005;

    if (Math.abs(this.offsetX) + Math.abs(this.offsetY) < min) {
      this.stopAnimation();
    }
    return true;
  }

}
