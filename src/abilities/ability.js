let idx = 0;
const TARGET_SELECT = {
  none: idx,
  creature: idx++,
  tile: idx++,
  self: idx++
};

class Ability {
  constructor(settings) {
    const { name, description, cost, charges, effectFn, targetSelect, usesTurn } = { ...settings };
    this.name = name || '';
    this.description = description || '';
    this.cost = cost || 0;
    this.charges = charges || 0;
    this.effectFn = effectFn || (() => { });
    this.targetSelect = targetSelect || TARGET_SELECT.none; // indicates how/if a target needs to be selected
    this.usesTurn = usesTurn || false;
  }

  use(creature) {
    // check ability to use
    if (this.cost && creature.mana < this.cost) {
      return false;
    }
    let charges = creature?.weapon?.charges || 0;
    if (this.charges < charges) {
      return false;
    }

    // resolve targeting
    let target;
    switch (this.targetSelect) {
    case TARGET_SELECT.none:
      target = null;
      break;
    case TARGET_SELECT.self:
      target = creature;
      break;
    default:
      throw new Error('Unimplemented targeting!');
    }

    // try to apply effect, exit if it didn't work
    if (!this.effectFn(target)) return false;

    // subtract mana
    creature.mana = (creature.mana || 0) - this.cost;

    // subtract charges
    if (creature?.weapon?.charges) {
      creature.weapon.charges = charges--;
    }

    // advance turn if player
    if (this.usesTurn && creature.isPlayer) {
      creature.game.tick();
    }

    // return success
    return true;
  }
}

export { Ability, TARGET_SELECT };
