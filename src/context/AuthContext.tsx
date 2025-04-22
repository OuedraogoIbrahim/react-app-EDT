// import React, {
//   createContext,
//   useEffect,
//   useState,
//   ReactNode,
//   useContext,
// } from "react";

// interface AuthContextType {
//   user: any | null;
//   token: string | null;
//   isConnected: boolean;
//   setUser: (user: any) => void;
//   setToken: (token: string) => void;
//   setIsConnected: (isConnected: boolean) => void;
// }

// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   isConnected: true,
//   setUser: () => {},
//   setToken: () => {},
//   setIsConnected: () => {},
// });

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<any | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState<boolean>(false);

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem("user");
//       setUser(storedUser ? JSON.parse(storedUser) : null);
//       setIsConnected(storedUser ? true : false);
//     } catch (error) {
//       console.error("Error lors de la récuperation des données:", error);
//     }
//   }, []);

//   const values = {
//     user,
//     token,
//     isConnected,
//     setUser,
//     setToken,
//     setIsConnected,
//   };

//   return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  isConnected: boolean;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  setIsConnected: (isConnected: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isConnected: false,
  setUser: () => {},
  setToken: () => {},
  setIsConnected: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const values = {
    user,
    token,
    isConnected,
    setUser,
    setToken,
    setIsConnected,
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
