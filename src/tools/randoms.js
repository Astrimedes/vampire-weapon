
const inRange = (min, max) => {
  return Math.floor(Math.random()*(max-min+1))+min;
};

const inFloatRange = (min, max) => {
  return (Math.random() * (max - min + 1)) + min;
};

/**
 * Shuffle items in place in array
 * @param {[]} arr
 */
const shuffle = arr => {
  let temp, r;
  for (let i = 1; i < arr.length; i++) {
    r = inRange(0,i);
    temp = arr[i];
    arr[i] = arr[r];
    arr[r] = temp;
  }
  return arr;
};

/**
 * Choose a member of array randomly
 * @param {[]} arr
 */
const any = arr => arr[inRange(0, arr.length - 1)];

/**
 *
 * @param  {...any} arrayIn
 * @returns
 */
const anyIn = (...arrayIn) => any(arrayIn);

const Rng = {
  inRange,
  inFloatRange,
  shuffle,
  any,
  anyIn
};

export { Rng };
