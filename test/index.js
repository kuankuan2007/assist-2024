"use strict";

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
    for (const i of ObjectControl.specialObjectCompare) {
      const result2 = i(value1, value2);
      if (result2 !== null) {
        return result2;
      }
    }
    if (recursion) {
      if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length)
          return false;
        for (let i = 0; i < value1.length; i++) {
          if (!ObjectControl.isEqual(value1[i], value2[i], recursion))
            return false;
        }
        return true;
      } else {
        if (Object.getPrototypeOf(value1) !== Object.getPrototypeOf(value2))
          return false;
        if (!ObjectControl.isEqual(
          ObjectControl.getOwnProperties(value1),
          ObjectControl.getOwnProperties(value2),
          false
        ))
          return false;
        for (const i of ObjectControl.getOwnProperties(value1)) {
          if (!ObjectControl.isEqual(value1[i], value2[i], true))
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
    for (const i of ObjectControl.specialObjectClone) {
      const result2 = i(value);
      if (result2 !== null) {
        map.set(value, result2);
        return result2;
      }
    }
    if (recursion) {
      if (Array.isArray(value)) {
        const result2 = [];
        map.set(value, result2);
        for (let i = 0; i < value.length; i++) {
          result2[i] = ObjectControl.clone(value[i], recursion, map);
        }
        return result2;
      } else {
        const result2 = {};
        map.set(value, result2);
        for (const i of ObjectControl.getOwnProperties(value)) {
          result2[i] = ObjectControl.clone(value[i], recursion, map);
        }
        return result2;
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
var ObjectControl = {
  isEqual,
  clone,
  getOwnProperties,
  specialObjectCompare,
  specialObjectClone
};
var ObjectControl_default = ObjectControl;

// src/kjson.ts
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
        (i) => limitingDraft ? ObjectControl_default.isEqual(i, target) : i === target
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
        (i) => limitingDraft ? ObjectControl_default.isEqual(i, target) : i === target
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
function parse(data2) {
  function dfsTransform(target, dataList) {
    if (target instanceof Object) {
      for (const i in target) {
        target[i] = dfsTransform(
          target[i],
          dataList
        );
      }
    } else if (typeof target === "string") {
      const result2 = /^(.*)::([a-zA-Z\d]+)$/s.exec(target);
      if (result2) {
        const [, data3, type] = result2;
        let flag = false;
        for (const i of specialValues) {
          if (i.name === type) {
            flag = true;
            target = i.replacer(data3, dataList);
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
  try {
    const dataList = JSON.parse(data2);
    if (!Array.isArray(dataList)) {
      throw new Error("Invalid K-JSON data");
    }
    dfsTransform(dataList, dataList);
    return dataList[0];
  } catch {
    throw new Error("Invalid K-JSON data");
  }
}
function stringify(obj, limitingDraft = false) {
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
  dfsTransform(obj);
  return JSON.stringify(saveList);
}
var kjson_default = Object.freeze(
  Object.assign(/* @__PURE__ */ Object.create(null), {
    parse,
    stringify,
    toString: () => "[K-JSON object]"
  })
);

// test/index.ts
var v1 = {
  a1: 2,
  b1: "b"
};
v1["c1"] = v1;
var data = {
  a: 1,
  b: "b",
  c: null,
  d: [v1, "111", 21, /* @__PURE__ */ new Date()],
  e: NaN
};
data["d"].push(data);
data["f"] = v1;
var result = kjson_default.stringify(data, void 0, true);
console.log(result);
console.log(kjson_default.parse(result, true));
setInterval(() => {
});
//# sourceMappingURL=index.js.map