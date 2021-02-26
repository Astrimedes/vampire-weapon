import { Sprite } from '../../assets/sprite-index';

let baseDamage = 4;

let baseParry = baseDamage;
let baseParryFreq = 1;

let baseReach = 1;

let baseHp = 4;


let baseCharm = {
  power: 0.667,
  stuns: false
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
