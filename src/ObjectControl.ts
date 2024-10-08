const specialObjectCompare: ((value1: unknown, value2: unknown) => boolean | null)[] = [
  (value1, value2) => {
    if (value1 instanceof Date && value2 instanceof Date) {
      return value1.getTime() === value2.getTime();
    }
    return null;
  },
  (value1, value2) => {
    if (value1 instanceof Set && value2 instanceof Set) {
      if (value1.size !== value2.size) return false;
      for (const i of value1) {
        if (!value2.has(i)) return false;
      }
      return true;
    }
    return null;
  },
  (value1, value2) => {
    if (Number.isNaN(value1) && Number.isNaN(value2)) return true;
    return null;
  },
];
export const specialObjectClone: ((value: unknown) => unknown | null)[] = [
  (value) => {
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    return null;
  },
  (value) => {
    if (value instanceof Set) {
      return new Set(value);
    }
    return null;
  },
];
function isEqual(value1: unknown, value2: unknown, recursion: boolean = true): boolean {
  if (value1 === value2) return true;
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    if (value1 === null || value2 === null) return false;
    for (const i of _KObjectControl.specialObjectCompare) {
      const result = i(value1, value2);
      if (result !== null) {
        return result;
      }
    }
    if (recursion) {
      if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length) return false;
        for (let i = 0; i < value1.length; i++) {
          if (!_KObjectControl.isEqual(value1[i], value2[i], recursion)) return false;
        }
        return true;
      } else {
        if (Object.getPrototypeOf(value1) !== Object.getPrototypeOf(value2)) return false;
        if (
          !_KObjectControl.isEqual(
            _KObjectControl.getOwnProperties(value1),
            _KObjectControl.getOwnProperties(value2),
            false
          )
        )
          return false;
        for (const i of _KObjectControl.getOwnProperties(value1)) {
          if (!_KObjectControl.isEqual(value1[i], value2[i], true)) return false;
        }
        return true;
      }
    } else {
      return false;
    }
  } else {
    if (Number.isNaN(value1) && Number.isNaN(value2)) return true;
    return value1 === value2;
  }
}
function clone<T>(
  value: T,
  recursion: boolean = true,
  map: WeakMap<object, unknown> = new WeakMap()
): T {
  if (value instanceof Object) {
    if (map.has(value)) return map.get(value) as T;
    for (const i of _KObjectControl.specialObjectClone) {
      const result = i(value);
      if (result !== null) {
        map.set(value, result);
        return result as T;
      }
    }
    if (recursion) {
      if (Array.isArray(value)) {
        const result: unknown[] = [];
        map.set(value, result);
        for (let i = 0; i < value.length; i++) {
          result[i] = _KObjectControl.clone(value[i], recursion, map);
        }
        return result as T;
      } else {
        const result: Record<string | symbol, unknown> = {};
        map.set(value, result);
        for (const i of _KObjectControl.getOwnProperties(value)) {
          result[i as keyof typeof result] = _KObjectControl.clone(
            value[i as keyof T],
            recursion,
            map
          );
        }
        return result as T;
      }
    } else {
      console.warn('ObjectControl cannot clone non-recursive object');
      return value;
    }
  } else {
    return value;
  }
}
function getOwnProperties<T extends object>(value: T): Set<keyof T> {
  return new Set([
    ...Object.getOwnPropertyNames(value),
    ...Object.getOwnPropertySymbols(value),
  ]) as Set<keyof T>;
}
const _KObjectControl = {
  isEqual,
  clone,
  getOwnProperties,
  specialObjectCompare,
  specialObjectClone,
} as const;
export {};
globalThis.KObjectControl = _KObjectControl;
Object.defineProperty(globalThis, 'KObjectControl', {
  enumerable: false,
  value: _KObjectControl,
});
declare global {
  // eslint-disable-next-line no-var
  var KObjectControl: typeof _KObjectControl;
}
export default _KObjectControl;
