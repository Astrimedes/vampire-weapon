import { Sprite } from '../../assets/sprite-index';

let baseDamage = 3;

let baseParry = baseDamage;
let baseParryFreq = 3;

let baseReach = 1;
let baseHp = baseDamage * 3;

let baseCharm = {
  power: 1
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
    charmConfig: { ...baseCharm },
    energy: 75
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
    charmConfig: { ...baseCharm },
    energy: 50
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
    charmConfig: { ...baseCharm },
    energy: 25
  }
];

export default weaponTypes;
