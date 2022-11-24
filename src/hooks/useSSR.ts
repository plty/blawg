import { useEffect, useState } from "react";

export const useSSR = () => {
    const [state, setState] = useState<boolean>(true);
    useEffect(() => {
        setState(false);
    }, []);
    return state;
};
