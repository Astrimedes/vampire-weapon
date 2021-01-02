const SIZE = 13;

const levels = {
  1: {
    size: SIZE,
    slimes: 1
  },
  2: {
    size: SIZE,
    chumps: 1,
    slimes: 1
  },
  3: {
    size: SIZE,
    chumps: 1,
    slimes: 1,
    spiders: 1,
    slowguys: 0
  },
  4: {
    size: SIZE,
    chumps: 1,
    slimes: 2,
    spiders: 1,
    slowguys: 0
  },
  5: {
    size: SIZE,
    chumps: 1,
    slimes: 1,
    spiders: 1,
    slowguys: 1
  },
  6: {
    size: SIZE,
    chumps: 1,
    slimes: 2,
    spiders: 1,
    slowguys: 1
  },
  7: {
    size: SIZE,
    chumps: 1,
    slimes: 2,
    spiders: 2,
    slowguys: 1
  }
};

export { levels };
