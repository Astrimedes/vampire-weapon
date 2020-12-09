class Ability {
  constructor(name, cost, description) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }

  getUpgradeCost(player) {
    let rank = player.effects.find(e => e.type == this.name)?.value || 0;
    return this.cost * (rank + 1);
  }
}

class Reach extends Ability {
  getUpgradeCost(player) {
    return player.reach * this.cost;
  }
}

const Abilities = [
  new Ability('Bleed', 5, '+1 💉, +1/3 dmg per attack'),
  new Ability('Fire', 25, '+1 dmg per attack'),
  new Ability('Ice', 35, '+1 turn stun per attack'),
  new Reach('Size', 50, '+1 tile attack reach')
];

export { Ability, Abilities };
