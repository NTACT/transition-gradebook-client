
// Needed to parse errors in responses where the content type is ArrayBuffer (ex. the report pdf endpoints)
export default function parseArrayBuffer(arrayBuffer) {
  return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}
