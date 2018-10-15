module.exports = function splitArray(array) {
  const midIndex = Math.ceil(array.length / 2);
  return [
    array.slice(0, midIndex),
    array.slice(midIndex),
  ];
}