// src/KJSON.ts
var specialValues = [
  {
    name: "date",
    matcher: (target) => target instanceof Date ? target.getTime().toString() : void 0,
    replacer: (value) => new Date(Number(value))
  },
  {
    name: "nan",
    matcher: (target) => Number.isNaN(target) ? "" : void 0,
    replacer: () => NaN
  },
  {
    name: "binary",
    matcher: (target) => {
      if (typeof ArrayBuffer !== "undefined" && target instanceof ArrayBuffer) {
        return btoa(String.fromCharCode(...new Uint8Array(target)));
      }
      if (typeof Uint8Array !== "undefined" && target instanceof Uint8Array) {
        return btoa(String.fromCharCode(...target));
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer(target)) {
        return target.toString("base64");
      }
    },
    replacer: (value) => {
      if (typeof ArrayBuffer !== "undefined") {
        return new Uint8Array(
          atob(value).split("").map((c) => c.charCodeAt(0))
        ).buffer;
      }
      throw new Error("ArrayBuffer is not supported");
    }
  },
  {
    name: "null",
    matcher: (target) => target === null ? "" : void 0,
    replacer: () => null
  },
  {
    name: "string",
    matcher: (target) => typeof target === "string" ? target : void 0,
    replacer: (value) => value
  },
  {
    name: "array",
    matcher: (target, saveList, dataMap, dfsTransform, limitingDraft) => {
      if (!Array.isArray(target))
        return void 0;
      const index = dataMap.findIndex(
        (i) => limitingDraft ? KObjectControl.isEqual(i, target) : i === target
      );
      if (index !== -1)
        return index.toString();
      const id2 = saveList.length;
      saveList[id2] = null;
      dataMap[id2] = target;
      saveList[id2] = target.map((i) => dfsTransform(i));
      return id2.toString();
    },
    replacer: (value, saveList) => {
      return saveList[parseInt(value)];
    }
  },
  {
    name: "object",
    matcher: (target, saveList, dataMap, dfsTransform, limitingDraft) => {
      if (!(target instanceof Object))
        return void 0;
      const index = dataMap.findIndex(
        (i) => limitingDraft ? KObjectControl.isEqual(i, target) : i === target
      );
      if (index !== -1)
        return index.toString();
      const id2 = saveList.length;
      saveList[id2] = {};
      dataMap[id2] = target;
      for (const i in target) {
        saveList[id2][i] = dfsTransform(
          target[i]
        );
      }
      return id2.toString();
    },
    replacer: (value, saveList) => {
      return saveList[parseInt(value)];
    }
  }
];
function parse(data) {
  try {
    const dataList = JSON.parse(data);
    return structureKJSONList(dataList);
  } catch {
    throw new Error("Invalid K-JSON data");
  }
}
function structureKJSONList(data) {
  if (!Array.isArray(data)) {
    return data;
  }
  function dfsTransform(target, dataList) {
    if (target instanceof Object) {
      for (const i in target) {
        target[i] = dfsTransform(
          target[i],
          dataList
        );
      }
    } else if (typeof target === "string") {
      const result = /^(.*)::([a-zA-Z\d]+)$/s.exec(target);
      if (result) {
        const [, data2, type] = result;
        let flag = false;
        for (const i of specialValues) {
          if (i.name === type) {
            flag = true;
            target = i.replacer(data2, dataList);
          }
        }
        if (!flag) {
          throw new Error("Invalid K-JSON data which has unknown type");
        }
      } else {
        throw new Error("Invalid K-JSON data which is string but could not be parsed");
      }
    }
    return target;
  }
  dfsTransform(data, data);
  return data[0];
}
function stringify(obj, limitingDraft = false) {
  return JSON.stringify(normalizeToKJSONList(obj, limitingDraft));
}
function normalizeToKJSONList(obj, limitingDraft = false) {
  const saveList = [];
  const dataMap = [];
  function dfsTransform(obj2) {
    for (const i of specialValues) {
      const result2 = i.matcher(obj2, saveList, dataMap, dfsTransform, limitingDraft);
      if (result2 !== void 0) {
        return `${result2}::${i.name}`;
      }
    }
    return obj2;
  }
  const result = dfsTransform(obj);
  return saveList.length ? saveList : result;
}
var _KJSON = {
  parse,
  stringify,
  structureKJSONList,
  normalizeToKJSONList,
  specialValues
};
Object.defineProperty(globalThis, "KJSON", {
  enumerable: false,
  value: _KJSON,
  writable: false
});
var KJSON_default = _KJSON;

// src/ObjectControl.ts
var specialObjectCompare = [
  (value1, value2) => {
    if (value1 instanceof Date && value2 instanceof Date) {
      return value1.getTime() === value2.getTime();
    }
    return null;
  },
  (value1, value2) => {
    if (value1 instanceof Set && value2 instanceof Set) {
      if (value1.size !== value2.size)
        return false;
      for (const i of value1) {
        if (!value2.has(i))
          return false;
      }
      return true;
    }
    return null;
  },
  (value1, value2) => {
    if (Number.isNaN(value1) && Number.isNaN(value2))
      return true;
    return null;
  }
];
var specialObjectClone = [
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
  }
];
function isEqual(value1, value2, recursion = true) {
  if (value1 === value2)
    return true;
  if (typeof value1 === "object" && typeof value2 === "object") {
    if (value1 === null || value2 === null)
      return false;
    for (const i of _KObjectControl.specialObjectCompare) {
      const result = i(value1, value2);
      if (result !== null) {
        return result;
      }
    }
    if (recursion) {
      if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length)
          return false;
        for (let i = 0; i < value1.length; i++) {
          if (!_KObjectControl.isEqual(value1[i], value2[i], recursion))
            return false;
        }
        return true;
      } else {
        if (Object.getPrototypeOf(value1) !== Object.getPrototypeOf(value2))
          return false;
        if (!_KObjectControl.isEqual(
          _KObjectControl.getOwnProperties(value1),
          _KObjectControl.getOwnProperties(value2),
          false
        ))
          return false;
        for (const i of _KObjectControl.getOwnProperties(value1)) {
          if (!_KObjectControl.isEqual(value1[i], value2[i], true))
            return false;
        }
        return true;
      }
    } else {
      return false;
    }
  } else {
    if (Number.isNaN(value1) && Number.isNaN(value2))
      return true;
    return value1 === value2;
  }
}
function clone(value, recursion = true, map = /* @__PURE__ */ new WeakMap()) {
  if (value instanceof Object) {
    if (map.has(value))
      return map.get(value);
    for (const i of _KObjectControl.specialObjectClone) {
      const result = i(value);
      if (result !== null) {
        map.set(value, result);
        return result;
      }
    }
    if (recursion) {
      if (Array.isArray(value)) {
        const result = [];
        map.set(value, result);
        for (let i = 0; i < value.length; i++) {
          result[i] = _KObjectControl.clone(value[i], recursion, map);
        }
        return result;
      } else {
        const result = {};
        map.set(value, result);
        for (const i of _KObjectControl.getOwnProperties(value)) {
          result[i] = _KObjectControl.clone(
            value[i],
            recursion,
            map
          );
        }
        return result;
      }
    } else {
      console.warn("ObjectControl cannot clone non-recursive object");
      return value;
    }
  } else {
    return value;
  }
}
function getOwnProperties(value) {
  return /* @__PURE__ */ new Set([
    ...Object.getOwnPropertyNames(value),
    ...Object.getOwnPropertySymbols(value)
  ]);
}
var _KObjectControl = {
  isEqual,
  clone,
  getOwnProperties,
  specialObjectCompare,
  specialObjectClone
};
globalThis.KObjectControl = _KObjectControl;
Object.defineProperty(globalThis, "KObjectControl", {
  enumerable: false,
  value: _KObjectControl
});
var ObjectControl_default = _KObjectControl;

// src/Other.ts
function clamp(min, value, max) {
  return Math.min(Math.max(min, value), max);
}
function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}
function decode(data, encoding = "utf-8") {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(data);
}
function base64urlbtoa(data) {
  return btoa(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64urlatob(data) {
  return atob(data.replace(/-/g, "+").replace(/_/g, "/"));
}
function uint8arrayToNumber(array) {
  if (array instanceof ArrayBuffer) {
    return uint8arrayToNumber(new Uint8Array(array));
  }
  return array.reduce((res, now) => {
    return res * 2 ** 8 + now;
  }, 0);
}
function numberToUint8Array(number) {
  const result = [];
  while (number) {
    result.unshift(number % 2 ** 8);
    number = Math.floor(number / 2 ** 8);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return new Uint8Array(result);
}
var _KOther = {
  clamp,
  random,
  randomInt,
  decode,
  base64url: {
    btoa: base64urlbtoa,
    atob: base64urlatob
  },
  uint8arrayToNumber,
  numberToUint8Array
};
var Other_default = _KOther;
Object.defineProperty(globalThis, "KOther", { value: _KOther, enumerable: false });

// src/index.ts
var id = "@kuankuan/assist-2024";
export {
  KJSON_default as KJSON,
  ObjectControl_default as KObjectControl,
  Other_default as KOther,
  id
};
/**
 * @license MulanPSL-2.0
 * @package @kuankuan/assist-2024
 * @author Kuankuan - https://github.com/kuankuan2007
 * @copyright (c) 2024, Kuankuan
 * @version 2.1
 */
//# sourceMappingURL=index.js.map
