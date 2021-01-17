import { InputType } from '../input/inputstate';
import { moveInput } from '../input/moveInput';
import { targetInput } from '../input/targetInput';

const restartLevelAction = (game) => {
  game.loadLevel(1);
};
const restartGame = new InputType('restart', restartLevelAction, restartLevelAction);

const totTitleAction = (game) => {
  if (game.hud) {
    game.hud.hide();
  }
  game.setGameState(GameState.Title);
};
const toTitle = new InputType('toTitle', totTitleAction, totTitleAction);

const none = new InputType('none');

const InputStates = {
  Move: moveInput,
  Target: targetInput,
  Restart: restartGame,
  ToTitle: toTitle,
  None: none
};

const GameState = {
  Loading: {
    id: 0,
    dimmed: false,
    hasMap: false,
    input: InputStates.None
  },
  Title: {
    id: 1,
    dimmed: true,
    hasMap: false,
    input: InputStates.Restart
  },
  Play: {
    id: 2,
    dimmed: false,
    hasMap: true,
    input: InputStates.Move
  },
  GameOver: {
    id: 3,
    dimmed: true,
    hasMap: true,
    input: InputStates.ToTitle
  },
  Dialog: {
    id: 4,
    dimmed: true,
    hasMap: true,
    input: InputStates.None
  },
};

export { GameState, InputStates };
