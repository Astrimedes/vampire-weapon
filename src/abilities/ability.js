class Ability {
  /**
   *
   * @param {object} settings
   * @param {string} settings.name
   * @param {string} settings.description
   * @param {number} settings.cost
   * @param {function} settings.effectFn
   * @param {boolean} settings.oneTime
   */
  constructor(settings) {
    const { name, description, cost, effectFn } = { ...settings };
    this.name = name || '';
    this.description = description || '';
    this.cost = cost || 0;
    this.effectFn = effectFn || (() => { });
    this.oneTime = !!settings.oneTime;
    this.applied = 0;
  }

  /**
   * @param {import ('../../systems/game').default} game
   * @param {import('../../weapons/player').default} player
   */
  applyAbility(game, player) {
    this.effectFn(player);
    this.applied++;
  }
}

export { Ability };
