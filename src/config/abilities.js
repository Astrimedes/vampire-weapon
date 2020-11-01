class Ability {
  constructor(name, cost, description) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }

  getUpgradeCost(player) {
    let rank = player.effects.find(e => e.type == this.name)?.value || 0;
    console.log(this.name + ': rank ' + rank);
    return this.cost + (rank * this.cost);
  }
}

class Reach extends Ability {
  getUpgradeCost(player) {
    return player.reach * this.cost;
  }
}

const Abilities = [
  new Ability('Bleed', 5, 'More blood gain (+1/pt), some damage (+1/3 pts)'),
  new Ability('Fire', 10, 'More attack damage (+1/pt)'),
  new Ability('Ice', 15, 'Stuns opponents (1 turn +1 turn / 2 add\'l pts)'),
  new Reach('Size', 20, 'Increases reach (+1 tile / pt)')
];

export { Ability, Abilities };