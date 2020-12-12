import { InputType } from './inputstate';
import { MoveInput } from './moveInput';
import { restartGame } from './sharedActions';

const InputStates = {
  Move: MoveInput,
  Target: new InputType('target'),
  Restart: new InputType('restart', restartGame, restartGame),
  None: new InputType('none'),
};

export { InputStates };
