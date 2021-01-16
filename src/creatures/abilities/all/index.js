import { health } from './health';
import { damage } from './damage';

const allAbilities = [
  health,
  damage
];

const getStartingAbilities = () => {
  return Array.from(allAbilities);
};

export { allAbilities, getStartingAbilities };
