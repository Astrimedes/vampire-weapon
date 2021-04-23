const lerp = (v0, v1, t) => v0 + t * (v1 - v0);

const square = x => x * x;

const flip = x => 1 - x;

const easeIn = (time) => {
  return square(time);
};

const easeOut = (time) => {
  return flip(square(flip(time)));
};


export { lerp, easeIn, easeOut, flip };
