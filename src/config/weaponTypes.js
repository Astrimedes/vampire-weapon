import { Sprite } from '../../assets/sprite-index';

let baseDamage = 4;

let baseParry = baseDamage;
let baseParryFreq = 2;

let baseReach = 1;

let baseHp = 0;

let baseCharm = {
  power: 1,
  curses: [
    { name: 'weak', effect: target => target.strength = (target.strength || 0) - 1 },
    { name: 'slow', effect: target => target.agility = (target.agility || 0) - 1 }
  ]
};

const weaponTypes = [
  {
    name: 'sword',
    reach: baseReach,
    damage: baseDamage,
    parry: baseParry,

    parryFrequency: baseParryFreq,
    spriteNumber: Sprite.Weapon.sword,
    drawSprite: true,
    maxHp: baseHp,
    charmConfig: { ...baseCharm }
  },
  {
    name: 'axe',
    reach: baseReach,
    damage: baseDamage * 1.5,
    parry: baseParry,

    parryFrequency: baseParryFreq,
    spriteNumber: Sprite.Weapon.axe,
    drawSprite: true,
    maxHp: baseHp,
    charmConfig: { ...baseCharm }
  },
  {
    name: 'spear',
    reach: baseReach * 2,
    damage: baseDamage,
    parry: baseParry * 0.5,

    parryFrequency: baseParryFreq,
    spriteNumber: Sprite.Weapon.spear,
    drawSprite: true,
    maxHp: baseHp,
    charmConfig: { ...baseCharm }
  }
];

export default weaponTypes;
