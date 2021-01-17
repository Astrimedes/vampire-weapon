import { InputType } from './inputstate';
import { MoveInput } from './moveInput';
import { restartGame, toTitle } from './sharedActions';
import { TargetInput } from './targetInput';

const InputStates = {
  Move: MoveInput,
  Target: TargetInput,
  Restart: new InputType('restart', restartGame, restartGame),
  ToTitle: new InputType('toTitle', toTitle, toTitle),
  None: new InputType('none'),
};

export { InputStates };
