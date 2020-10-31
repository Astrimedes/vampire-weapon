import { Sprite } from '../../assets/sprite-index';

class Tile {
  constructor(x, y, spriteNumber, passable) {
    this.x = x;
    this.y = y;

    this.type = '';

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
    this.type = 'floor';
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.wall, false);
    this.type = 'wall';
  }
}

class Exit extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.exit, true);
    this.type = 'exit';
  }

  stepOn(creature) {
    if (creature.isPlayer) {
      creature.game.exit();
    }
  }
}

class Shop extends Tile {
  constructor(x, y) {
    super(x, y, Sprite.Map.shop, true);
    this.type = 'shop';
  }

  stepOn(creature) {
    if (creature.isPlayer) {
      creature.game.callAbilityDialog();
    }
  }
}

export { Tile, Floor, Wall, Exit, Shop };
