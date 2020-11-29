class Ability {
  constructor(name, cost, description) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }

  getUpgradeCost(player) {
    let rank = player.effects.find(e => e.type == this.name)?.value || 0;
    return this.cost + (rank * this.cost);
  }
}

class Reach extends Ability {
  getUpgradeCost(player) {
    return player.reach * this.cost;
  }
}

const Abilities = [
  new Ability('Bleed', 5, '+1 💉, +1/3 dmg'),
  new Ability('Fire', 50, '+1 dmg'),
  new Ability('Ice', 50, '+1 turn stun'),
  new Reach('Size', 100, '+1 tile attack reach')
];

export { Ability, Abilities };
