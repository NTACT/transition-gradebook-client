export default function getId(object) {
  if(object && typeof object === 'object') return object.id;
  return object;
}