function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(min, value), max);
}
function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(random(min, max + 1));
}
function decode(data: ArrayBuffer | Uint8Array | Buffer, encoding: string = 'utf-8') {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(data);
}
function base64urlbtoa(data: string) {
  return btoa(data).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64urlatob(data: string) {
  return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
}
function uint8arrayToNumber(array: Uint8Array | ArrayBuffer) {
  if (array instanceof ArrayBuffer) {
    return uint8arrayToNumber(new Uint8Array(array));
  }
  return (array.reduce as InstanceType<typeof Uint8Array>['reduce'])<number>((res, now) => {
    return res * 2 ** 8 + now;
  }, 0);
}
function numberToUint8Array(number: number) {
  const result: number[] = [];
  while (number) {
    result.unshift(number % 2 ** 8);
    number = Math.floor(number / 2 ** 8);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return new Uint8Array(result);
}
const _KOther = {
  clamp,
  random,
  randomInt,
  decode,
  base64url: {
    btoa: base64urlbtoa,
    atob: base64urlatob,
  } as const,
  uint8arrayToNumber,
  numberToUint8Array,
} as const;
export default _KOther;
declare global {
  // eslint-disable-next-line no-var
  var KOther: typeof _KOther;
}
Object.defineProperty(globalThis, 'KOther', { value: _KOther, enumerable: false });
