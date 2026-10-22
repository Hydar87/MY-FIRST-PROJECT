
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    // This will print every time any component calls useAuth()
    console.log("Hook useAuth() returned Token:", context?.token);
        console.log("Full Auth Hook Return:", context);

    
    return context;
};

// ADD THIS LINE so default imports work:
export default useAuth;
