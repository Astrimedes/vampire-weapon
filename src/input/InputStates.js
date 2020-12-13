import { InputType } from './inputstate';
import { MoveInput } from './moveInput';
import { restartGame } from './sharedActions';
import { TargetInput } from './targetInput';

const InputStates = {
  Move: MoveInput,
  Target: TargetInput,
  Restart: new InputType('restart', restartGame, restartGame),
  None: new InputType('none'),
};

export { InputStates };
