import ObjectControl from './ObjectControl';

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
        limitingDraft ? ObjectControl.isEqual(i, target) : i === target
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
        limitingDraft ? ObjectControl.isEqual(i, target) : i === target
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
export function parse(data: string): object {
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
          console.warn('Invalid K-JSON data which has unknown type');
        }
      } else {
        console.warn('Invalid K-JSON data which is string but could not be parsed');
      }
    }
    return target;
  }
  try {
    const dataList = JSON.parse(data);
    if (!Array.isArray(dataList)) {
      throw new Error('Invalid K-JSON data');
    }
    dfsTransform(dataList, dataList);
    return dataList[0];
  } catch {
    throw new Error('Invalid K-JSON data');
  }
}
export function stringify(obj: object, limitingDraft: boolean = false): string {
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
  dfsTransform(obj);
  return JSON.stringify(saveList);
}

export default Object.freeze(
  Object.assign(Object.create(null), {
    parse,
    stringify,
    toString: () => '[K-JSON object]',
  })
);
