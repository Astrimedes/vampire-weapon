import HealthAbility from './health';
import DamageAbility from './damage';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new HealthAbility(), new DamageAbility()];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
