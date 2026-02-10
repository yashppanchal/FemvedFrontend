import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => string | null;
  register: (data: RegisterData) => string | null;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const USERS_KEY = "femved_users";
const SESSION_KEY = "femved_session";

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession());

  // Keep localStorage in sync
  useEffect(() => {
    saveSession(user);
  }, [user]);

  /** Returns an error message string, or null on success. */
  const login = useCallback((email: string, password: string): string | null => {
    const users = getStoredUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) return "Invalid email or password.";
    const { password: _, ...safe } = match;
    setUser(safe);
    return null;
  }, []);

  /** Returns an error message string, or null on success. */
  const register = useCallback((data: RegisterData): string | null => {
    if (data.password !== data.confirmPassword) return "Passwords do not match.";
    if (data.password.length < 6) return "Password must be at least 6 characters.";

    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return "An account with this email already exists.";
    }

    const newUser: StoredUser = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    };
    saveStoredUsers([...users, newUser]);

    const { password: _, ...safe } = newUser;
    setUser(safe);
    return null;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
