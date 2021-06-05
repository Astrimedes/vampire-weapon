import DamageAbility from './damage';
import BlinkAbility from './blink';
// import ParryAbility from './parry';
import Curse1Ability from './curse1';
import HealthAbility from './health';
import EnergyAbility from './energy';

let allAbilities = [];


const getStartingAbilities = () => {
  allAbilities = [new DamageAbility(), new BlinkAbility(), new Curse1Ability(), new HealthAbility(), new EnergyAbility() ];
  return allAbilities;
};

export { allAbilities, getStartingAbilities };
