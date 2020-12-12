/**
 * @typedef {import('./game').default} Game
 */

let idx = 1;

const Actions = {
  up: idx++,
  down: idx++,
  left: idx++,
  right: idx++,
  ok: idx++,
  cancel: idx++
};

const getActionDirection = (action) => {
  let dir = { x: 0, y: 0 };
  if (action == Actions.up) {
    dir.y--;
  } else if (action == Actions.down) {
    dir.y++;
  } else if (action == Actions.left) {
    dir.x--;
  } else if (action == Actions.right) {
    dir.x++;
  }
  return dir;
};

const defaultKeys = [
  { action: Actions.up, keys: ['w', 'ArrowUp', '8'] },
  { action: Actions.down, keys: ['s', 'ArrowDown', '2'] },
  { action: Actions.left, keys: ['a', 'ArrowLeft', '4'] },
  { action: Actions.right, keys: ['d', 'ArrowRight', '6'] },
  { action: Actions.ok, keys: ['Enter', ' ', '5'] },
  { action: Actions.cancel, keys: ['Escape', '0'] }
];

/**
 * InputReader settings object
 * @typedef {Object} InputReaderConfig
 * @property {Document} doc - HTML doc
 * @property {Game} game - Game
 * @property {boolean} useKeyboard - accepts keyboard input
 * @property {boolean} usePointer - accepts mouse/touch input
 */

class InputReader {
  /**
   * Reads input from html page, sends 'Actions' to Game
   * @param {InputReaderConfig} settings
   */
  constructor(settings) {
    const { doc, game, useKeyboard, usePointer } = { ...settings };
    this.setDoc(doc);
    this.game = game;
    this.useKeyboard = useKeyboard;
    this.usePointer = usePointer;
  }

  /**
   *
   * @param {Document} doc
   */
  setDoc(doc) {
    this.document = doc;
  }

  setupInput(keyConfig = defaultKeys) {
    let game = this.game;
    let doc = this.document;

    // keyboard - document listens
    const keyboardListen = (e) => {
      let action = keyConfig.find(kc => kc.keys.find(k => k == e.key))?.action;
      console.log(e, action);
      if (!action || !game.isInputAllowed()) return;

      game.sendUserAction(action);
    };
    doc.onkeydown = keyboardListen;

    // mouse events - canvas listens
    let canvas = doc.querySelector('canvas');

    const mousedownListen = e => {
      e.preventDefault();
      if (!game.isInputAllowed()) return;

      const tile = game.map ? game.renderer.getTileAt(e.clientX, e.clientY, game.map) : null;
      game.sendUserTileSelect(tile);
    };
    canvas.onmousedown = mousedownListen;

    const mousemoveListen = e => {
      if (!game.isInputAllowed()) {
        game.highlightTile = null;
        return;
      }

      const tile = game.renderer.getTileAt(e.clientX, e.clientY, game.map);
      game.highlightTile = tile && game.map.inBounds(tile.x, tile.y) ? tile : null;
    };
    canvas.onmousemove = mousemoveListen;

    const mouseleaveListen = () => {
      game.highlightTile = null;
    };
    canvas.onmouseleave = mouseleaveListen;
  }
}

export { Actions, getActionDirection, InputReader };