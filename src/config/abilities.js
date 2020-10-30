class Ability {
  constructor(name, cost, description) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }
}

const abilities = [
  new Ability('Bleed', 5, 'Increases blood rewards for each point. Deals +1 damage per 3 points'),
  new Ability('Fire', 10, 'Deals direct damage, +1 per point'),
  new Ability('Ice', 15, 'Stuns opponents, +1 turn per 2 points'),
  new Ability('Size', 25, 'Increases reach by +1 tile per point')
];

export { Ability, abilities };