import {Sprite} from '../../assets/sprite-index';

const weaponTypes = [
  {
    name: 'sword',
    reach: 1,
    damage: 4,
    parry: 6,
    parryFrequency: 3,
    spriteNumber: Sprite.Weapon.sword,
    drawSprite: true,
    maxHp: 4
  },
  {
    name: 'axe',
    reach: 1,
    damage: 6,
    parry: 4,
    parryFrequency: 3,
    spriteNumber: Sprite.Weapon.axe,
    drawSprite: true,
    maxHp: 4
  },
  {
    name: 'spear',
    reach: 2,
    damage: 4,
    parry: 2,
    parryFrequency: 3,
    spriteNumber: Sprite.Weapon.spear,
    drawSprite: true,
    maxHp: 4
  }
];

export default weaponTypes;
