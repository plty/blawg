import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
const TopLevelProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default TopLevelProvider;
