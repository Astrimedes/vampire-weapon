import { InputType, moveToTile, restartGame } from './inputstate';

const InputStates = {
  Move: new InputType('move', moveToTile),
  Target: new InputType('target'),
  Restart: new InputType('restart', restartGame),
  None: new InputType('none'),
};

export { InputStates };
