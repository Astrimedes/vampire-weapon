let INDEX = 0;

const NO_OP = () => { };

class InputType {
  constructor(name, callback = NO_OP) {
    this.id = INDEX++;
    this.name = name;
    this.defaultAction = callback;
  }
}

const moveToTile = (game, tile) => {
  // advance by 1 when player tries to move when stunned
  if (game.player.stunned) {
    return game.tick();
  }

  // raw distance
  const xDist = tile.x - game.player.x;
  const yDist = tile.y - game.player.y;

  // raw direction
  let x = Math.sign(xDist);
  let y = Math.sign(yDist);

  // flag
  let solved = false;
  let neighbors;

  if (x != 0 && y != 0) {
    // if both directions indicated, check adjacent tiles, select a passable one
    neighbors = game.map.getAdjacentPassableNeighbors(game?.player?.wielder?.tile);
    const xDest = game.player.x + x;
    const yDest = game.player.y + y;
    neighbors.filter(t => (t.x == xDest || t.y == yDest));
    if (neighbors.length) {
      let idx = 0;
      // if we've chosen a 'diagonal' move...
      if (neighbors[idx].x == xDest && neighbors[idx].y == yDest) {
        if (neighbors.length > 1) {
          idx++;
        } else {
          idx = -1;
        }
      }
      if (idx != -1) {
        x = neighbors[idx].x == xDest ? x : 0;
        y = neighbors[idx].y == yDest ? y : 0;
        solved = true;
      }
    }
  }

  if (!solved) {
    // choose the longer distance
    x = Math.abs(xDist) >= Math.abs(yDist) ? x : 0;
    y = x == 0 ? y : 0;
  }

  if (x == 0 && y == 0) return;

  // finally move
  if (game.player.tryMove(x, y)) {
    game.tick();
  }
};

const restartGame = (game) => {
  game.loadLevel(1);
};

const InputState = {
  Move: new InputType('move', moveToTile),
  Target: new InputType('target'),
  Restart: new InputType('restart', restartGame),
  None: new InputType('none'),
};

export { InputState };
