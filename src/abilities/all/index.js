import HealthAbility from './health';
import DamageAbility from './damage';
import BlinkAbility from './blink';
import ParryAbility from './parry';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new DamageAbility(), new ParryAbility(), new HealthAbility(), new BlinkAbility()];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
