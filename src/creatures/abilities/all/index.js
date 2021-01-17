import HealthAbility from './health';
import DamageAbility from './damage';
import BlinkAbility from './blink';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new HealthAbility(), new DamageAbility(), new BlinkAbility()];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
