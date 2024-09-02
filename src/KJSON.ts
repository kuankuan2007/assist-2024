const specialValues: {
  name: string;
  matcher: (
    target: unknown,
    saveList: unknown[],
    dataMap: unknown[],
    dfsTransform: (obj: unknown) => unknown,
    limitingDraft: boolean
  ) => undefined | string;
  replacer: (value: string, saveList: unknown[]) => unknown;
}[] = [
  {
    name: 'date',
    matcher: (target) => (target instanceof Date ? target.getTime().toString() : void 0),
    replacer: (value) => new Date(Number(value)),
  },
  {
    name: 'nan',
    matcher: (target) => (Number.isNaN(target as number) ? '' : void 0),
    replacer: () => NaN,
  },
  {
    name: 'binary',
    matcher: (target) => {
      if (typeof ArrayBuffer !== 'undefined' && target instanceof ArrayBuffer) {
        return btoa(String.fromCharCode(...new Uint8Array(target)));
      }
      if (typeof Uint8Array !== 'undefined' && target instanceof Uint8Array) {
        return btoa(String.fromCharCode(...target));
      }
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(target)) {
        return target.toString('base64');
      }
    },
    replacer: (value) => {
      if (typeof ArrayBuffer !== 'undefined') {
        return new Uint8Array(
          atob(value)
            .split('')
            .map((c) => c.charCodeAt(0))
        ).buffer;
      }
      throw new Error('ArrayBuffer is not supported');
    },
  },
  {
    name: 'null',
    matcher: (target) => (target === null ? '' : void 0),
    replacer: () => null,
  },
  {
    name: 'string',
    matcher: (target) => (typeof target === 'string' ? target : void 0),
    replacer: (value) => value,
  },
  {
    name: 'array',
    matcher: (target, saveList, dataMap, dfsTransform, limitingDraft) => {
      if (!Array.isArray(target)) return void 0;
      const index = dataMap.findIndex((i) =>
        limitingDraft ? KObjectControl.isEqual(i, target) : i === target
      );
      if (index !== -1) return index.toString();
      const id = saveList.length;
      saveList[id] = null;
      dataMap[id] = target;
      saveList[id] = target.map((i) => dfsTransform(i));
      return id.toString();
    },
    replacer: (value, saveList) => {
      return saveList[parseInt(value)];
    },
  },
  {
    name: 'object',
    matcher: (target, saveList, dataMap, dfsTransform, limitingDraft) => {
      if (!(target instanceof Object)) return void 0;
      const index = dataMap.findIndex((i) =>
        limitingDraft ? KObjectControl.isEqual(i, target) : i === target
      );
      if (index !== -1) return index.toString();
      const id = saveList.length;
      saveList[id] = {};
      dataMap[id] = target;
      for (const i in target) {
        (saveList[id] as Record<string, unknown>)[i] = dfsTransform(
          target[i as keyof typeof target]
        );
      }
      return id.toString();
    },
    replacer: (value, saveList) => {
      return saveList[parseInt(value)];
    },
  },
];
function parse(data: string): unknown {
  try {
    const dataList = JSON.parse(data);
    return structureKJSONList(dataList);
  } catch {
    throw new Error('Invalid K-JSON data');
  }
}
function structureKJSONList(data: unknown): unknown {
  if (!Array.isArray(data)) {
    return data;
  }
  function dfsTransform(target: unknown, dataList: unknown[]): unknown {
    if (target instanceof Object) {
      for (const i in target) {
        (target as Record<string, unknown>)[i] = dfsTransform(
          target[i as keyof typeof target],
          dataList
        );
      }
    } else if (typeof target === 'string') {
      const result = /^(.*)::([a-zA-Z\d]+)$/s.exec(target);
      if (result) {
        const [, data, type] = result;
        let flag = false;
        for (const i of specialValues) {
          if (i.name === type) {
            flag = true;
            target = i.replacer(data, dataList);
          }
        }
        if (!flag) {
          throw new Error('Invalid K-JSON data which has unknown type');
        }
      } else {
        throw new Error('Invalid K-JSON data which is string but could not be parsed');
      }
    }
    return target;
  }
  dfsTransform(data, data);
  return data[0];
}
function stringify(obj: unknown, limitingDraft: boolean = false): string {
  return JSON.stringify(normalizeToKJSONList(obj, limitingDraft));
}
function normalizeToKJSONList(obj: unknown, limitingDraft: boolean = false) {
  const saveList: unknown[] = [];
  const dataMap: unknown[] = [];
  function dfsTransform(obj: unknown): unknown {
    for (const i of specialValues) {
      const result = i.matcher(obj, saveList, dataMap, dfsTransform, limitingDraft);
      if (result !== void 0) {
        return `${result}::${i.name}`;
      }
    }
    return obj;
  }
  const result = dfsTransform(obj);
  return saveList.length ? saveList : result;
}
const _KJSON = {
  parse,
  stringify,
  structureKJSONList,
  normalizeToKJSONList,
  specialValues,
} as const;
Object.defineProperty(globalThis, 'KJSON', {
  enumerable: false,
  value: _KJSON,
  writable: false,
});
declare global {
  // eslint-disable-next-line no-var
  var KJSON: typeof _KJSON;
}
export default _KJSON;
