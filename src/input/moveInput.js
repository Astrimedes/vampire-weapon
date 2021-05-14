import { Actions, getActionDirection } from '../systems/inputReader';
import { InputType } from './inputstate';

/**
 * @typedef {import('../systems/game').default} Game
 */
/**
 *
 * @param {Game} game
 * @param {{x: number, y: number}} tile
 */

const moveTileCallback = (game, tile) => {
  let playerTile = game.player.wielder.tile;
  let path = game.map.findPath(playerTile, game.map.getTile(tile.x, tile.y));
  if (!path.length) return;

  // look at path's first tile after start tile
  let [x, y] = [path[1].x - playerTile.x, path[1].y - playerTile.y];

  if (!x && !y) return;

  // finally move
  if (game.player.tryMove(x, y)) {
    return game.tick();
  }

  return false;
};
/**
 *
 * @param {Game} game
 * @param {number} command
 */

const moveCommandCallback = (game, command) => {
  const tile = game?.player?.wielder?.tile;
  if (!tile) return false;

  // wait input command
  if (command == Actions.ok)
    return game.wait();

  // directional
  let dir = getActionDirection(command);
  if (!dir || (dir.x == 0 && dir.y == 0))
    return false;

  const targetTile = game.map.getTile(tile.x + dir.x, tile.y + dir.y);
  if (!targetTile)
    return false;

  return moveTileCallback(game, targetTile);
};

export const moveInput = new InputType('move', moveTileCallback, moveCommandCallback);
