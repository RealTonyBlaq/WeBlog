import { useContext, createContext, useState, useEffect } from "react";
import { getProfile } from "../api/auth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
     // fetch user data
     (async () => {
        const data = await getProfile();
        setUser(data.user);
      })();
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
