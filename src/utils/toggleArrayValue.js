module.exports = function toggleArrayValue(array, value) {
  if(array.includes(value)) {
    array.remove(value);
  } else {
    array.push(value);
  }
};