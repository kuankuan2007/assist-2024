"use strict";
(() => {
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
        const id = saveList.length;
        saveList[id] = null;
        dataMap[id] = target;
        saveList[id] = target.map((i) => dfsTransform(i));
        return id.toString();
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
        const id = saveList.length;
        saveList[id] = {};
        dataMap[id] = target;
        for (const i in target) {
          saveList[id][i] = dfsTransform(
            target[i]
          );
        }
        return id.toString();
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
            console.warn("Invalid K-JSON data which has unknown type");
          }
        } else {
          console.warn("Invalid K-JSON data which is string but could not be parsed");
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
    writable: false,
    value: _KObjectControl
  });

  // src/Other.ts
  function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
  }
  var _KOther = {
    clamp
  };
  Object.defineProperty(globalThis, "KOther", { value: _KOther, writable: false, enumerable: false });
})();
/**
 * @license MulanPSL-2.0
 * @package @kuankuan/assist-2024
 * @author Kuankuan - https://github.com/kuankuan2007
 * @copyright (c) 2022, Kuankuan
 * @version 2.0
 */
//# sourceMappingURL=index.js.map