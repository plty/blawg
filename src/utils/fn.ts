import _zip from "lodash/zip";

export const zip = function <T1, T2>(a: T1[], b: T2[]): [T1, T2][] {
    const len = Math.min(a.length, b.length);
    return _zip(a.slice(0, len), b.slice(0, len)) as [T1, T2][];
};
