import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "../mocks/api";
import type { User } from "../mocks/types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, name: string, password: string) => Promise<User>;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "tiu-dam-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as User;
      setUser(parsed);
      return;
    }
    if (import.meta.env.DEV) {
      api.getMockUsers().then((list) => setUser(list[0] ?? null));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const next = await api.login(email, password);
    setUser(next);
    return next;
  };

  const register = async (email: string, name: string, password: string) => {
    const next = await api.register(email, name, password);
    setUser(next);
    return next;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchUser = async (userId: string) => {
    const list = await api.getMockUsers();
    const picked = list.find((item) => item.id === userId) ?? null;
    setUser(picked);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, switchUser }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return ctx;
}
