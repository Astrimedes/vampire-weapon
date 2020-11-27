import { InputState } from './inputstate';

const GameState = {
  Loading: {
    id: 0,
    dimmed: false,
    hasMap: false,
    input: InputState.None
  },
  Title: {
    id: 1,
    dimmed: true,
    hasMap: false,
    input: InputState.Restart
  },
  Play: {
    id: 2,
    dimmed: false,
    hasMap: true,
    input: InputState.Move
  },
  GameOver: {
    id: 3,
    dimmed: true,
    hasMap: true,
    input: InputState.Restart
  },
  Dialog: {
    id: 4,
    dimmed: true,
    hasMap: true,
    input: InputState.None
  },
};

export { GameState };
