import {Sprite} from '../../assets/sprite-index';

const weaponTypes = [
  {
    name: 'sword',
    reach: 1,
    damage: 2,
    parry: 4,
    parryFrequency: 2,
    spriteNumber: Sprite.Weapon.sword,
    drawSprite: true
  },
  {
    name: 'axe',
    reach: 1,
    damage: 3,
    parry: 2,
    parryFrequency: 3,
    spriteNumber: Sprite.Weapon.axe,
    drawSprite: true
  },
  {
    name: 'spear',
    reach: 2,
    damage: 2,
    parry: 1,
    parryFrequency: 4,
    spriteNumber: Sprite.Weapon.spear,
    drawSprite: true
  }
];

export default weaponTypes;