import { Sprite } from '../../assets/sprite-index';

class Tile {
  constructor(x, y, spriteNumber, passable) {
    this.x = x;
    this.y = y;

    this.spriteNumber = spriteNumber;

    this.passable = passable;

    this.creature = null;
  }

  stepOn(creature) {
    // do something
  }
}

class Floor extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.floor, true);
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.wall, false);
  }
}

class Exit extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.exit, true);
  }

  stepOn(creature) {
    if (creature.isPlayer) {
      creature.game.exit();
    }
  }
}

export { Tile, Floor, Wall, Exit };
