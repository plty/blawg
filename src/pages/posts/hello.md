---
layout: ../../layouts/Post.astro

unique_id: 32595503-C0ED-4D35-9E7A-838476F6E74E
short_id: next-level-playground

title: Random Custom Hooks
description: >
    Collection of custom hooks I find useful
pub_date: 2022-11-17T00:00:00Z
tags: ["react"]
---

# Random Hooks I find useful

## SSR Safe useLocalStorageState

```ts
export const useStoredState = function <T>(
    key: string,
    value: T,
): [T, (v: T) => void] {
    const [state, setState] = useLocalstorageState<T>(key, value);
    const ssr = useSSR();
    return [ssr ? value : state, setState];
};
```

## SSR Check Hack

```ts
export const useSSR = (): boolean => {
    const [state, setState] = useState(true);
    useEffect(() => {
        setState(false);
    }, []);
    return state;
};
```

## usePromise with deps

```ts
export const usePromise = function <T>(
    promiseFn: () => Promise<T>,
    deps: unknown[],
): UsePromiseResponse<T> {
    const [state, setState] = useState<UsePromiseResponse<T>>(pending());
    useEffect(() => {
        let stale = false;
        promiseFn()
            .then((v) => !stale && setState(resolve(v)))
            .catch((e) => !stale && setState(reject(e)));

        return () => {
            stale = true;
            setState(pending());
        };
    }, deps);
    return state;
};
```
