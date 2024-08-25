import { createContext, useState, useEffect } from "react";
import { getProfile } from "../api/auth";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
     // fetch user data
     (async () => {
        try {
          const data = await getProfile();
        setUser(data.user);
        } catch (e) {
          console.log(e);
          setUser(null)
        }
      })();
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;
