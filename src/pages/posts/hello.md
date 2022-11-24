---
layout: ../../layouts/Post.astro

unique_id: 32595503-C0ED-4D35-9E7A-838476F6E74E
short_id: next-level-playground

title: Random Custom Hooks
description: >
    Collection of custom hooks that I find useful
pub_date: 2022-11-17T00:00:00Z
tags: ["react"]
---

# Random Hooks that I find useful

## SSR Safe useLocalStorageState

```tsx
function useStoredState<T>(key: string, value: T): [T, (v: T) => void] {
    const [storedState, setStoredState] = useLocalstorageState<T>(key, value);
    const [state, setState] = useState<T>(value);
    useEffect(() => {
        setState(storedState);
    }, [storedState]);

    return [state, setStoredState];
}
```
