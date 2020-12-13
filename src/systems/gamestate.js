import { InputStates } from '../input/InputStates';

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
    input: InputStates.Restart
  },
  Dialog: {
    id: 4,
    dimmed: true,
    hasMap: true,
    input: InputStates.None
  },
};

export { GameState };
