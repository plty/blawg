import { DependencyList, useEffect, useState } from "react";

type Pending = {
    state: "pending";
    value: undefined;
    error: undefined;
};

type Resolve<T> = {
    state: "resolve";
    value: T;
    error: undefined;
};

type Reject<E> = {
    state: "reject";
    value: undefined;
    error: E;
};

type UsePromiseResponse<T, E = any> = Pending | Resolve<T> | Reject<E>;

const pending = (): Pending => ({
    state: "pending",
    value: undefined,
    error: undefined,
});
const reject = function <E>(e: E): Reject<E> {
    return { state: "reject", value: undefined, error: e };
};
const resolve = function <T>(v: T): Resolve<T> {
    return { state: "resolve", value: v, error: undefined };
};

export const usePromise = function <T>(
    f: () => Promise<T>,
    deps: unknown[],
): UsePromiseResponse<T> {
    const [state, setState] = useState<UsePromiseResponse<T>>(pending());
    useEffect(() => {
        let stale = false;
        f()
            .then((v) => !stale && setState(resolve(v)))
            .catch((e) => !stale && setState(reject(e)));

        return () => {
            stale = true;
            setState(pending());
        };
    }, deps);
    return state;
};

export const useHintedPromise = function <T, D extends DependencyList>(
    hint: Map<D, T>,
    f: () => Promise<T>,
    deps: D,
): UsePromiseResponse<T> {
    const [state, setState] = useState<UsePromiseResponse<T>>(
        hint.has(deps) ? resolve(hint.get(deps)!) : pending(),
    );
    useEffect(() => {
        let stale = false;
        f()
            .then((v) => !stale && setState(resolve(v)))
            .catch((e) => !stale && setState(reject(e)));

        return () => {
            stale = true;
            setState(pending());
        };
    }, deps);
    return state;
};
