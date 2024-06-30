export declare const specialObjectClone: ((value: unknown) => unknown | null)[];
declare function isEqual(value1: unknown, value2: unknown, recursion?: boolean): boolean;
declare function clone<T>(value: T, recursion?: boolean, map?: WeakMap<object, unknown>): T;
declare function getOwnProperties<T extends object>(value: T): Set<keyof T>;
declare const _KObjectControl: {
    readonly isEqual: typeof isEqual;
    readonly clone: typeof clone;
    readonly getOwnProperties: typeof getOwnProperties;
    readonly specialObjectCompare: ((value1: unknown, value2: unknown) => boolean | null)[];
    readonly specialObjectClone: ((value: unknown) => unknown)[];
};
export {};
declare global {
    var KObjectControl: typeof _KObjectControl;
}
