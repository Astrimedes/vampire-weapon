import { Sprite } from '../../assets/sprite-index';

class Trap {
  constructor(name, spriteUnarmed, spriteArmed, turnInterval = 0, visible = true, damage = 1) {
    this.name = name;
    this.spriteUnarmed = spriteUnarmed;
    this.spriteArmed = spriteArmed;
    this.interval = turnInterval;
    this.visible = visible;
    this.damage = damage;
  }

  effect(creature) {
    creature.canParry = false;
    creature.lastParryTurn = creature.game.turnCount;
    creature.hit(this.damage, this);
    let name = creature.isPlayer ? 'You' : 'The ' + creature.name;
    let verbAdd = creature?.isPlayer ? '' : 's';
    creature.game.hud.writeMessage(`${name} trigger${verbAdd} a ${this.name} trap, taking ${this.damage} damage!`);
  }
}

const Traps = [
  new Trap('spike', Sprite.Map.trapUnarmed, Sprite.Map.trapArmed, 2, true, 1)
];

function getTrapByName(name) {
  return Traps.find(t => t.name == name);
}

function isTrapActive(trap, tile, game) {
  if (!(game?.monsters?.length > 0)) return false;
  return calcTurnsUntilActive(game.turnCount + (tile.trapTurnOffset || 0), trap.interval) == 0;
}

function calcTrapTurns(trap, tile, game) {
  if (!(game?.monsters?.length > 0)) return Infinity;
  return calcTurnsUntilActive(game.turnCount + (tile.trapTurnOffset || 0), trap.interval);
}

function calcTurnsUntilActive(turnCount, interval) {
  let rem = turnCount % interval;
  return rem == 0 ? 0 : interval - rem;
}

export { Traps, getTrapByName, isTrapActive, calcTrapTurns };
