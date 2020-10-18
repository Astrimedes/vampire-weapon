const State = {
  Loading: {
    id: 0,
    dimmed: false,
    hasMap: false
  },
  Title: {
    id: 1,
    dimmed: true,
    hasMap: false
  },
  Play: {
    id: 2,
    dimmed: false,
    hasMap: true
  },
  GameOver: {
    id: 3,
    dimmed: true,
    hasMap: true
  },
  Dialog: {
    id: 4,
    dimmed: true,
    hasMap: true
  },
};

export { State };
