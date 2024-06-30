declare function clamp(min: number, value: number, max: number): number;
declare const _KOther: {
    readonly clamp: typeof clamp;
};
export {};
declare global {
    var KOther: typeof _KOther;
}
export {};
