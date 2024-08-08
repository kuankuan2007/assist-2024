function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(min, value), max);
}
function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number) {
  return Math.floor(random(min, max + 1));
}
const _KOther = {
  clamp,
  random,
  randomInt,
} as const;
export {};
declare global {
  // eslint-disable-next-line no-var
  var KOther: typeof _KOther;
}
Object.defineProperty(globalThis, 'KOther', { value: _KOther, writable: false, enumerable: false });
export {};
