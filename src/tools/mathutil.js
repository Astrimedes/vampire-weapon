const lerp = (start, end, fraction, maxMove = 0, minDiff = 0.0001) => {
  let diff = end - start;
  if (maxMove > 0) {
    diff = Math.min(diff, maxMove);
    diff = Math.max(diff, -maxMove);
  }
  if (Math.abs(diff) < minDiff) {
    return end;
  }
  return start + diff * fraction;
};

const square = x => x * x;

const flip = x => 1 - x;

const easeIn = (time) => {
  return time * time;
};

const easeOut = (time) => {
  return flip(square(flip(time)));
};

const spike = (time) => {
  if (time <= 0.5) return easeIn(time / 0.5);
  return easeIn(flip(time)/0.5);
};

export { lerp, easeIn, easeOut, flip, spike };