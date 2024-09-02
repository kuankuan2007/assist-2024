declare function parse(data: string): unknown;
declare function structureKJSONList(data: unknown): unknown;
declare function stringify(obj: unknown, limitingDraft?: boolean): string;
declare function normalizeToKJSONList(obj: unknown, limitingDraft?: boolean): unknown;
declare const _KJSON: {
    readonly parse: typeof parse;
    readonly stringify: typeof stringify;
    readonly structureKJSONList: typeof structureKJSONList;
    readonly normalizeToKJSONList: typeof normalizeToKJSONList;
    readonly specialValues: {
        name: string;
        matcher: (target: unknown, saveList: unknown[], dataMap: unknown[], dfsTransform: (obj: unknown) => unknown, limitingDraft: boolean) => undefined | string;
        replacer: (value: string, saveList: unknown[]) => unknown;
    }[];
};
declare global {
    var KJSON: typeof _KJSON;
}
export default _KJSON;
