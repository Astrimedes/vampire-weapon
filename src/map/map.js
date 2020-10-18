
// eslint-disable-next-line no-unused-vars
import { Tile, Floor, Wall, Exit } from './tile.js';
import { Rng } from '../tools/randoms.js';

export default class Dungeon {
  generateLevel(numTiles) {
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
    this.randomPassableTile();
    return true;
  }

  generateTiles(numTiles) {
    const tiles = this.tiles = [];

    const wallChance = 0.18;
    let passable = 0;

    for (let i = 0; i < numTiles; i++) {
      tiles[i] = [];
      for (let j = 0; j < numTiles; j++) {
        if (Math.random() < wallChance || !this.inBounds(i,j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          tiles[i][j] = new Floor(i, j);
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
      found = tile.passable && !tile.creature;
      maxTries++;
    }

    if (!found) throw `Couldn't find passable tile in ${maxTries} tries`;
    return tile;
  }

  inBounds(x, y) {
    let limit = this.numTiles - 1;
    return x > 0 && y > 0 && x < limit && y < limit;
  }

  inBoundsWall(x,y) {
    let limit = this.numTiles - 1;
    return x >= 0 && y >= 0 && x <= limit && y <= limit;
  }

  getTile(x, y) {
    if (this.inBounds(x, y)) {
      return this.tiles[x][y];
    } else {
      return new Wall(x, y);
    }
  }

  getNeighbor(tile, dx, dy){
    return this.getTile(tile.x + dx, tile.y + dy);
  }

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
   *
   * @param {Tile} tile
   */
  getConnectedTiles(tile){
    let connectedTiles = [tile];
    let frontier = [tile];

    while(frontier.length){
      let neighbors = frontier.pop();
      neighbors = this.getAdjacentPassableNeighbors(neighbors)
        .filter(t => !connectedTiles.includes(t));

      connectedTiles = connectedTiles.concat(neighbors);
      frontier = frontier.concat(neighbors);
    }
    return connectedTiles;
  }
}
