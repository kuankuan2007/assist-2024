function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(min, value), max);
}
const _KOther = {
  clamp,
} as const;
export {};
declare global {
  // eslint-disable-next-line no-var
  var KOther: typeof _KOther;
}
Object.defineProperty(globalThis, 'KOther', { value: _KOther, writable: false, enumerable: false });
export {};
