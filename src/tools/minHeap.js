// Taken from https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript, post by user https://stackoverflow.com/users/5459839/trincot

// // Simple Demo:
// let heap = [];
// MinHeap.push(heap, [26, "Helen"]);
// MinHeap.push(heap, [15, "Mike"]);
// MinHeap.push(heap, [20, "Samantha"]);
// MinHeap.push(heap, [21, "Timothy"]);
// MinHeap.push(heap, [19, "Patricia"]);

// let [age, name] = MinHeap.pop(heap);
// console.log(`${name} is the youngest with ${age} years`);
// ([age, name] = MinHeap.pop(heap));
// console.log(`Next is ${name} with ${age} years`);

/* MinHeap:
 * A collection of functions that operate on an array
 * of [key,...data] elements (nodes).
 */
const MinHeap = {
  /* siftDown:
     * The node at the given index of the given heap is sifted down in
     * its subtree until it does not have a child with a lesser value.
     */
  siftDown(heapArray, i=0, value=heapArray[i]) {
    if (i < heapArray.length) {
      let key = value[0]; // Grab the value to compare with
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // Choose the child with the least value
        let j = i*2+1;
        if (j+1 < heapArray.length && heapArray[j][0] > heapArray[j+1][0]) j++;
        // If no child has lesser value, then we've found the spot!
        if (j >= heapArray.length || key <= heapArray[j][0]) break;
        // Copy the selected child node one level up...
        heapArray[i] = heapArray[j];
        // ...and consider the child slot for putting our sifted node
        i = j;
      }
      heapArray[i] = value; // Place the sifted node at the found spot
    }
  },
  /* heapify:
     * The given array is reordered in-place so that it becomes a valid heap.
     * Elements in the given array must have a [0] property (e.g. arrays).
     * That [0] value serves as the key to establish the heap order. The rest
     * of such an element is just payload. It also returns the heap.
     */
  heapify(heapArray) {
    // Establish heap with an incremental, bottom-up process
    for (let i = heapArray.length>>1; i--; ) this.siftDown(heapArray, i);
    return heapArray;
  },
  /**
   * Extracts the root of the given heap, and returns it (the sortKey:value array).
   * Returns undefined if the heap is empty
   * @param {[]} heapArray
   * @returns {[]} array of [sortKey, value]
   */
  pop(heapArray) {
    // Pop the last leaf from the given heap, and exchange it with its root
    return this.exchange(heapArray, heapArray.pop()); // Returns the old root
  },
  /**
   * Replaces the root node of the given heap with the given node, and
     * returns the previous root. Returns the given node if the heap is empty.
     * This is similar to a call of pop and push, but is more efficient.
   * @param {[]} heapArray
   * @param {[]} keyValue Array of [sortKey, value]
   * @returns {*} old root node
   */
  exchange(heapArray, keyValue) {
    if (!heapArray.length) return keyValue;
    // Get the root node, so to return it later
    let oldValue = heapArray[0];
    // Inject the replacing node using the sift-down process
    this.siftDown(heapArray, 0, keyValue);
    return oldValue;
  },

  /**
   * Inserts the given node into the given heap. It returns the heap.
   * @param {[]} heapArray
   * @param {[]} keyValue Array of [sortKey, value]
   * @returns {[]} heapArray
   */
  push(heapArray, keyValue) {
    let key = keyValue[0],
      // First assume the insertion spot is at the very end (as a leaf)
      i = heapArray.length,
      j;
    // Then follow the path to the root, moving values down for as long
    // as they are greater than the value to be inserted
    while ((j = (i-1)>>1) >= 0 && key < heapArray[j][0]) {
      heapArray[i] = heapArray[j];
      i = j;
    }
    // Found the insertion spot
    heapArray[i] = keyValue;
    return heapArray;
  }
};

export { MinHeap };
