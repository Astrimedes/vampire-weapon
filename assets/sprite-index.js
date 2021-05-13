const Sprite = {
  Creature: {
    slime: 4,
    slimeDead: 5,
    slowguy: 8,
    slowguyDead: 9,
    chump: 14,
    chumpDead: 15,
    spider: 16,
    spiderDead: 17,
    witch: 21,
    witchDead: 22
  },
  Weapon: {
    sword: 0,
    bolt: 12,
    fistDead: 13,
    axe: 24,
    spear: 25
  },
  Map: {
    floor: 2,
    wall: 3,
    exit: 11,
    shop: 23,
    trapArmed: 27,
    trapUnarmed: 26
  },
  Icon: {
    parry: 6,
    parryBroken: 1,
    stun: 7,
    sleep: 28,
    fire: 10,
    bleed: 18,
    ice: 19
  },
  Item: {
    blood: 20
  }
};

export { Sprite };
