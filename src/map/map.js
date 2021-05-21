
// eslint-disable-next-line no-unused-vars
import { Tile, Floor, Wall, Exit, Shop } from './tile.js';
import { Rng } from '../tools/randoms.js';
import { MinHeap } from '../tools/minHeap.js';
import Game from '../systems/game.js';

export default class Dungeon {
  generateLevel(numTiles, shop) {
    this.numTiles = numTiles;
    let success = false;
    let tries = 0;
    let maxTries = 1000;
    while(!success && tries < maxTries) {
      success = this.generateTiles(numTiles) == this.getConnectedTiles(this.randomPassableTile()).length;
      tries--;
    }
    if (!success) throw `Error in level generation - couldn't complete in ${maxTries}`;

    // add exit tile
    let exitAdded = false;
    while (!exitAdded) {
      let tile = this.getAdjacentNeighbors(this.randomPassableTile()).find(t => t.type == 'wall' && !t.creature);
      if (tile) {
        this.replaceTile(tile, Exit);
        exitAdded = true;
      }
    }
    if (!exitAdded) throw 'Error in level generation - couldnt add exit tile';

    // add shop every 3rd floor?
    // if (shop) {
    //   let shopAdded = false;
    //   while (!shopAdded) {
    //     let tile = this.getAdjacentNeighbors(this.randomPassableTile()).find(t => t.type == 'wall' && !t.creature);
    //     if (tile) {
    //       this.replaceTile(tile, Shop);
    //       shopAdded = true;
    //     }
    //   }
    // }


    return exitAdded;
  }

  /**
   * Generate the dungeon
   * @param {number} numTiles total # of tiles to generate
   * @returns {number} # of passable tiles
   */
  generateTiles(numTiles) {
    const tiles = this.tiles = [];

    const wallChance = 0.33;
    const trapChance = 0.025;
    let passable = 0;

    for (let i = 0; i < numTiles; i++) {
      tiles[i] = [];
      for (let j = 0; j < numTiles; j++) {
        if (Math.random() < wallChance || this.boundaryWall(i,j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          let trapped = Math.random() < trapChance;
          let options = { trapped: trapped, trapType: trapped ? 'spike' : '' };
          tiles[i][j] = new Floor(i, j, options);
          passable++;
        }
      }
    }

    return passable;
  }

  randomPassableTile() {
    let tile;
    let x = 0;
    let y = 0;
    let maxTries = 0;
    let limit = 1000;
    let found = false;
    let maxTile = this.numTiles-1;
    while(maxTries < limit && !found) {
      x = Rng.inRange(0, maxTile);
      y = Rng.inRange(0, maxTile);

      tile = this.getTile(x, y);
      found = tile.passable && !tile.trapped && !tile.creature && tile.type === 'floor';
      maxTries++;
    }

    if (!found) throw `Couldn't find passable tile in ${maxTries} tries`;
    return tile;
  }

  inBounds(x, y) {
    let limit = this.numTiles - 1;
    return x >= 0 && y >= 0 && x <= limit && y <= limit;
  }

  boundaryWall(x, y) {
    let limit = this.numTiles - 1;
    return x == 0 || x == limit || y == 0 || y == limit;
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @returns {import('../map/tile').Tile} tile
   */
  getTile(x, y) {
    if (this.inBounds(x, y)) {
      return this.tiles[x][y];
    } else {
      return new Wall(x, y);
    }
  }

  /**
   *
   * @param {import('../map/tile').Tile} tile
   * @param {number} dx
   * @param {number} dy
   */
  getNeighbor(tile, dx, dy){
    return this.getTile(tile.x + dx, tile.y + dy);
  }

  /**
   *
   * @param {import('../map/tile').Tile} tile
   * @returns {Array<import('../map/tile').Tile>} nearby tiles
   */
  getAdjacentNeighbors(tile){
    let matches = Rng.shuffle([
      this.getNeighbor(tile, 0, -1),
      this.getNeighbor(tile, 0, 1),
      this.getNeighbor(tile, -1, 0),
      this.getNeighbor(tile, 1, 0)
    ]);
    return matches;
  }

  //manhattan distance
  dist(tileA, tileB) {
    return Math.abs(tileA.x-tileB.x)+Math.abs(tileA.y-tileB.y);
  }

  distVector(tileA, tileB) {
    return { x: tileA.x - tileB.x, y: tileA.y - tileB.y };
  }

  /**
   * Counts diagonal tiles as 1 tile for range
   * @param {import('./tile').Tile} tileA
   * @param {import('./tile').Tile} tileB
   */
  diagDist(tileA, tileB) {
    let xDist = Math.abs(tileA.x - tileB.x);
    let yDist = Math.abs(tileA.y - tileB.y);
    return Math.max(xDist, yDist);
  }

  getAdjacentPassableNeighbors(tile){
    return this.getAdjacentNeighbors(tile).filter(t => t.passable);
  }

  replaceTile(oldTile, newTileClass) {
    let newTile = new newTileClass(oldTile.x, oldTile.y);
    this.tiles[oldTile.x][oldTile.y] = newTile;

    // move creature
    let creature = oldTile.creature;
    if (creature) {
      newTile.creature = creature;
      if (creature.tile) {
        creature.tile = newTile;
      }
    }

    return newTile;
  }

  /**
   * Find an in-bounds tile near x, y that meets function criteria
   * @param {number} x
   * @param {number} y
   * @param {function(import('./tile').Tile): boolean?} selectFn  optional, with default: t => t.passable && !t.creature
   * @returns {import('./tile').Tile?} tile that meets criteria, or null
   */
  findTileNear(x, y, selectFn = t => t.passable && !t.creature) {
    let tile = this.getTile(Math.min(this.numTiles - 1, Math.max(0, x)), Math.min(this.numTiles - 1, Math.max(0, y)));
    if (!tile) return null;

    if (!selectFn(tile)) {
      let neighbors = this.getAdjacentNeighbors(tile);
      while (neighbors.length) {
        tile = neighbors.pop();
        if (selectFn(tile)) return tile;
      }
    }

    return null;
  }

  getCreatureTileCostFn(creature) {
    return t => (creature.ignoreWalls || t.passable) ? (t.trapped ? 10 : 1) : Infinity;
  }

  /**
   *
   * @param {import('./tile').Tile} startTile
   * @param {import('./tile').Tile} endTile
   * @param {function(import('./tile').Tile): number} tileCostFn function to determine move cost of tile (should be 0-100)
   * @returns {Array<Tile>} pathArray
   */
  findPath(startTile, endTile, tileCostFn = t => { return !t.passable ? Infinity : t.trapped ? 10 : 1; }) {
  // frontier = PriorityQueue()
  // frontier.put(start, 0)
  // came_from = dict()
  // cost_so_far = dict()
  // came_from[start] = None
  // cost_so_far[start] = 0
    // while not frontier.empty():
    //    current = frontier.get()

    //    if current == goal:
    //       break

    //    for next in graph.neighbors(current):
    //       new_cost = cost_so_far[current] + graph.cost(current, next)
    //       if next not in cost_so_far or new_cost < cost_so_far[next]:
    //          cost_so_far[next] = new_cost
    //          priority = new_cost + heuristic(goal, next)
    //          frontier.put(next, priority)
    //          came_from[next] = current

    // adapted from https://www.redblobgames.com/pathfinding/a-star/introduction.html
    if (!startTile || !endTile) return null;

    // frontier holds the list of new tiles found, in a queue sorted by least cost
    let frontier = [];
    MinHeap.push(frontier, [0, startTile]);
    // destToSource: key = destination tile, value = source tile we came from
    let destToSource = new Map();
    destToSource.set(startTile.id, null);
    // tileToCost: key = tile, value = cost to reach this tile so far
    let tileToCost = new Map();
    tileToCost.set(startTile.id, 0);

    while (frontier.length) {
      let current = MinHeap.pop(frontier)[1];

      // break completely if we found our goal
      if (current == endTile) break;

      // iterate through neighbors
      let neighbors = this.getAdjacentNeighbors(current);
      neighbors.forEach(next => {
        // get cost of this tile
        let tileCost = next == endTile ? 0 : tileCostFn(next);
        if (tileCost < Infinity) {
          let nextCost = (tileToCost.get(current.id)) + tileCost;
          if (!tileToCost.has(next.id) || nextCost < tileToCost.get(next.id)) {
            let priority = nextCost + (this.dist(current, endTile)); // use estimate to help determine priority
            MinHeap.push(frontier, [priority, next]);
            destToSource.set(next.id, current);
            tileToCost.set(next.id, nextCost);
          }
        }
      });
    }

    // create best path from lowest value of frontier (start from end tile)
    let path = [];
    if (frontier.length) {
      let tile = endTile;
      while (tile.id != startTile.id) {
        path.push(tile);
        tile = destToSource.get(tile.id);
      }
    }

    // return reversed array
    return path.reverse();
  }

  /**
   * Get a list of all connected passable tiles
   * @param {Tile} tile
   */
  getConnectedTiles(tile){
    return this.getConnectedWithFilter(tile, t => t.passable);
  }

  /**
   * Get horiztonal or veritcal tiles from center tile in range range
   * @param {Tile} tile
   * @param {number} range
   * @param {function(Tile):boolean} filterFn
   * @returns
   */
  getConnectedFacingTiles(tile, range = 100, filterFn) {
    if (!filterFn) filterFn = () => true;
    let path = [];
    let t = null;
    let steps;
    // right
    t = this.getTile(tile.x + 1, tile.y);
    steps = 0;
    while (t && steps < range && this.inBounds(t.x, t.y) && filterFn(t)) {
      let last = t;
      path.push(last);
      t = this.getTile(last.x + 1, last.y);
      steps++;
    }

    // left
    t = this.getTile(tile.x - 1, tile.y);
    steps = 0;
    while (t && steps < range && this.inBounds(t.x, t.y) && filterFn(t)) {
      let last = t;
      path.push(last);
      t = this.getTile(last.x - 1, last.y);
      steps++;
    }

    // down
    t = this.getTile(tile.x, tile.y + 1);
    steps = 0;
    while (t && steps < range && this.inBounds(t.x, t.y) && filterFn(t)) {
      let last = t;
      path.push(last);
      t = this.getTile(last.x, last.y + 1);
      steps++;
    }

    // up
    t = this.getTile(tile.x, tile.y - 1);
    steps = 0;
    while (t && steps < range && this.inBounds(t.x, t.y) && filterFn(t)) {
      let last = t;
      path.push(last);
      t = this.getTile(last.x, last.y - 1);
      steps++;
    }

    return path;
  }


  /**
   * Get a list of all connected tiles that meet filter criteria in  range
   * @param {import('../map/tile').Tile} centerTile
   * @param {function(import('../map/tile').Tile):boolean} filterFn function to qualify tile.
   * @param {number} maxRange max range (or Infinity)
   */
  getConnectedWithFilter(centerTile, filterFn = () => true, maxRange = 100) {
    let matchedTiles = [centerTile];
    let frontier = [centerTile];

    while (frontier.length) {
      // tile of interest
      let tile = frontier.pop();

      // connected tiles
      let matchNeighbors = this.getAdjacentNeighbors(tile).filter(t => t && !matchedTiles.includes(t) && filterFn(t));
      // add connected & matched tiles
      matchedTiles = matchedTiles.concat(matchNeighbors);

      // see if we should keep checking
      let nextDist = this.dist(centerTile, tile) + 1;
      if (nextDist < maxRange) {
        frontier = frontier.concat(matchNeighbors);
      }
    }

    // remove centerTile before returning results
    // matchedTiles.splice(0, 1);
    return matchedTiles;

  }
}
