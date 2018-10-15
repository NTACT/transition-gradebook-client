export default function findById(array, id) {
  return array.find(object => object && object.id === id);
};
