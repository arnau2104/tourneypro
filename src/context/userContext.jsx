import { createContext, useState, useEffect } from "react";
import { refreshToken } from '../services/refreshToken';


export const AuthContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  // comprobar sesión al cargar la app
  useEffect(() => {
    fetch("/api/me", {
      method: "GET",
      headers: {
         'Content-Type': 'application/json',
      },
      credentials: "include"
    }).then(async res => {
                    if(res.status === 401) { 
                        const refreshOk = await refreshToken();
    
                        if(!refreshOk) {
                            navigate('/login');
                            return;
                        }
    
                        return fetch('/api/me', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include'
                        })
                    }
                
                if(!res) return;
                return res.json();
            }
        ).then(data => {

          // console.log("message", data.message);
          console.log("data", data.user);
          setUser(data.user);
        })
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}