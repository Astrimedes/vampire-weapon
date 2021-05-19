import DamageAbility from './damage';
import BlinkAbility from './blink';
import ParryAbility from './parry';
import Curse1Ability from './curse1';
import HealthAbility from './health';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new DamageAbility(), new BlinkAbility(), new Curse1Ability(), new HealthAbility()];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
