class Ability {
  constructor(name, cost, description) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }
}

const abilities = [
  new Ability('Bleed', 5, 'Increases blood gain, +1 damage / 3 points'),
  new Ability('Fire', 10, 'Deals direct damage, +1 / point'),
  new Ability('Ice', 15, 'Stuns opponents, 1 turn +1 turn / 2 add\'l points'),
  new Ability('Size', 20, 'Increases reach by +1 tile / point')
];

export { Ability, abilities };