import { useEffect, useRef, useState } from "react";

type UsePromiseResponse<T, E = any> =
    | {
          state: "pending";
          value: undefined;
          error: undefined;
      }
    | {
          state: "reject";
          value: undefined;
          error: E;
      }
    | {
          state: "resolve";
          value: T;
          error: undefined;
      };

export const usePromise = function <T>(
    f: () => Promise<T>,
    deps: unknown[],
): UsePromiseResponse<T> {
    const [state, setState] = useState<UsePromiseResponse<T>>({
        state: "pending",
        value: undefined,
        error: undefined,
    });
    useEffect(() => {
        console.log("effect ran");
        let ok = true;
        f()
            .then(
                (v) =>
                    ok &&
                    setState({ state: "resolve", value: v, error: undefined }),
            )
            .catch(
                (e) =>
                    ok &&
                    setState({ state: "reject", error: e, value: undefined }),
            );

        return () => {
            ok = false;
            setState({ state: "pending", value: undefined, error: undefined });
        };
    }, deps ?? []);
    return state;
};
