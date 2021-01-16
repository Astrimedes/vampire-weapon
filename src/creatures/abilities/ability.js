class Ability {
  /**
   *
   * @param {object} settings
   * @param {string} settings.name
   * @param {string} settings.description
   * @param {number} settings.cost
   * @param {function} settings.effectFn
   * @param {function} settings.nextAbilityFn
   */
  constructor(settings) {
    const { name, description, cost, effectFn, nextAbilityFn } = { ...settings };
    this.name = name || '';
    this.description = description || '';
    this.cost = cost || 0;
    this.effectFn = effectFn || (() => { });
    this.nextAbilityFn = (nextAbilityFn || (() => { return false;})).bind(this);
  }

  /**
   * @param {import ('../../systems/game').default} game
   * @param {import('../../weapons/player').default} player
   */
  applyAbility(game, player) {
    console.log(this);
    this.effectFn(player);
    // player.abilities.push(this.name);

    // // remove this ability once chosen
    // game.allAbilities.splice(game.allAbilities.findIndex(this), 1);

    // // add any abilities created by this one
    // let result = this.nextAbilityFn(player);
    // let nextAbilities = Array.isArray(result) ? result : [result];
    // nextAbilities.forEach(na => {
    //   if (!na) return;
    //   game.allAbilities.push(na);
    // });
  }
}

export { Ability };
