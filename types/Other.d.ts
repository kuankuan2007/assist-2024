/// <reference types="node" />
declare function clamp(min: number, value: number, max: number): number;
declare function random(min: number, max: number): number;
declare function randomInt(min: number, max: number): number;
declare function decode(data: ArrayBuffer | Uint8Array | Buffer, encoding?: string): string;
declare function base64urlbtoa(data: string): string;
declare function base64urlatob(data: string): string;
declare function uint8arrayToNumber(array: Uint8Array | ArrayBuffer): number;
declare function numberToUint8Array(number: number): Uint8Array;
declare const _KOther: {
    readonly clamp: typeof clamp;
    readonly random: typeof random;
    readonly randomInt: typeof randomInt;
    readonly decode: typeof decode;
    readonly base64url: {
        readonly btoa: typeof base64urlbtoa;
        readonly atob: typeof base64urlatob;
    };
    readonly uint8arrayToNumber: typeof uint8arrayToNumber;
    readonly numberToUint8Array: typeof numberToUint8Array;
};
export default _KOther;
declare global {
    var KOther: typeof _KOther;
}
