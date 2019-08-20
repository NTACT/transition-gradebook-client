export default function last(array = []) {
    if(array.length) {
        return array[array.length - 1];
    }
    return undefined;
}