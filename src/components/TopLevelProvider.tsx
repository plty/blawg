import React from "react";

const TopLevelProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return <React.StrictMode>{children}</React.StrictMode>;
};

export default TopLevelProvider;
