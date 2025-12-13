import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  isLoggedIn: boolean;
  userName: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  function login(username: string, password: string) {
    // enkel hårdkodad inloggning just nu
    if (username === "admin" && password === "1234") {
      setIsLoggedIn(true);
      setUserName(username);
      navigate("/dashboard");
    } else {
      alert("Fel användarnamn eller lösenord");
    }
  }

  function logout() {
    setIsLoggedIn(false);
    setUserName(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
