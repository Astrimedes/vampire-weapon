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
  // advance by 1 when player tries to move when stunned
  if (game?.player?.wielder?.stunned) return game.tick();

  // raw distance
  const xDist = tile.x - game.player.x;
  const yDist = tile.y - game.player.y;

  // raw direction
  let x = Math.sign(xDist);
  let y = Math.sign(yDist);

  if (x != 0 && y != 0) {
    // if both directions indicated, check adjacent tiles, select a passable one
    let neighbors = game.map.getAdjacentPassableNeighbors(game?.player?.wielder?.tile);
    const xDest = game.player.x + x;
    const yDest = game.player.y + y;
    neighbors.filter(t => (t.x == xDest || t.y == yDest));
    if (neighbors.length) {
      let idx = 0;
      // if we've chosen a 'diagonal' move...
      if (neighbors[idx].x == xDest && neighbors[idx].y == yDest) {
        idx = neighbors.length > 1 ? idx + 1 : -1;
      }

      x = neighbors[idx].x == xDest ? x : 0;
      y = neighbors[idx].y == yDest ? y : 0;

      if (idx == -1) {
        // choose the longer distance
        x = Math.abs(xDist) >= Math.abs(yDist) ? x : 0;
        y = x == 0 ? y : 0;
      }
    }
  }

  if (x == 0 && y == 0) return;

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
  const tile = game?.player?.tile;
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
