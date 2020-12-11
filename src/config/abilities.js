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
    return this.cost * ((player.reach * 2) - 1);
  }
}

const startingAbilities = [
  new Ability('Bleed', 5, '+1 💉 gain per attack'),
  new Ability('Charm', 10, 'Removes stun after charm'),
  new Ability('Fire', 25, '+1 dmg per attack'),
  new Ability('Ice', 35, '+1 turn stun per attack'),
  new Reach('Size', 50, '+1 tile attack reach')
];

const Abilities = Array.from(startingAbilities);

Abilities.reset = () => {
  Abilities.splice(0, Abilities.length);
  startingAbilities.forEach(a => Abilities.push(a));
};

export { Ability, Abilities };
