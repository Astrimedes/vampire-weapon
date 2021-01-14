const lerp = (start, end, fraction, maxMove = 0, minDiff = 0.0001) => {
  let diff = end - start;
  if (maxMove > 0) {
    diff = Math.min(diff, maxMove);
    diff = Math.max(diff, -maxMove);
  }
  if (Math.abs(diff) < minDiff) {
    return end;
  }
  return start + (diff * Math.min(1, Math.max(0, fraction)));
};

const square = x => x * x;

const flip = x => 1 - x;

const easeIn = (time) => {
  return square(time);
};

const easeOut = (time) => {
  return flip(square(flip(time)));
};


export { lerp, easeIn, easeOut, flip };
