declare function clamp(min: number, value: number, max: number): number;
declare function random(min: number, max: number): number;
declare function randomInt(min: number, max: number): number;
declare const _KOther: {
    readonly clamp: typeof clamp;
    readonly random: typeof random;
    readonly randomInt: typeof randomInt;
};
export {};
declare global {
    var KOther: typeof _KOther;
}
export {};
