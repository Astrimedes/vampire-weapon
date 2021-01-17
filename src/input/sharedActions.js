import {GameState} from '../systems/gamestate';
const restartGame = (game) => {
  game.loadLevel(1);
};

const toTitle = (game) => {
  if (game.hud) {
    game.hud.hide();
  }
  game.setGameState(GameState.Title);
};

export { restartGame, toTitle };
