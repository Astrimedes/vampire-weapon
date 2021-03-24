
/**
 * Remove duplicates and return only unique values from array
 * @param {[]} arr Array to reduce to unique values by == comparison
 * @returns {[]} A new array containing only unique values
 */
const unique = arr => {
  if (!arr?.length || arr.length < 2) return arr.slice();
  return arr.filter((value, index) => {
    return arr.indexOf(value) == index;
  });
};

/**
 *
 * @param {[]} arr Array to reduce to unique-by-function values
 * @param {function(*, *):boolean} fn Comparison function - return true if 2 values in array are equal
 * @returns {[]} A new array containing only 'unique by function' values
 */
const uniqueFn = (arr, fn) => {
  if (!arr?.length || arr.length < 2) return arr.slice();
  return arr.filter((compareVal, index) => {
    let firstMatch = arr.find(innerVal => fn(compareVal, innerVal));
    return arr.indexOf(firstMatch) == index;
  });
};

const ArrayUtil = {
  unique,
  uniqueFn
};

export { ArrayUtil };
