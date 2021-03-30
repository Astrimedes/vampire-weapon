import DamageAbility from './damage';
import BlinkAbility from './blink';
import ParryAbility from './parry';
import Curse1Ability from './curse1';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new DamageAbility(), new ParryAbility(), new BlinkAbility(), new Curse1Ability()];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
