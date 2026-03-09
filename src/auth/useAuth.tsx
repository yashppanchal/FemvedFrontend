import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  type AuthTokens,
  type RegisterRequest,
} from "../api/auth";
import { ApiError } from "../api/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserRole {
  id: number;
  name: string;
}

export const ROLE_ADMIN: UserRole = { id: 1, name: "admin" };
export const ROLE_EXPERT: UserRole = { id: 2, name: "expert" };
export const ROLE_USER: UserRole = { id: 3, name: "user" };

export function getDashboardPath(role: UserRole): string {
  if (role.id === ROLE_ADMIN.id) return "/admin-dashboard";
  if (role.id === ROLE_EXPERT.id) return "/expert-dashboard";
  return "/";
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginResult {
  error: string | null;
  redirectTo: string;
}

interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<LoginResult>;
  updateUser: (data: UpdateProfileData) => string | null;
  updateAuthUser: (update: { firstName?: string; lastName?: string }) => void;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  /** Dial code sent to the API (e.g. "+91", "+44", "+1") */
  countryCode: string;
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const USERS_KEY = "femved_users";
const SESSION_KEY = "femved_session";
const TOKENS_KEY = "femved_tokens";
const AUTH_USER_WITH_TOKEN_KEY = "femved_auth_user";

function normalizeRole(raw: unknown): UserRole {
  if (raw && typeof raw === "object") {
    const roleObj = raw as Record<string, unknown>;
    const roleNameCandidate = roleObj.name ?? roleObj.role ?? roleObj.type;
    const roleName =
      typeof roleNameCandidate === "string"
        ? roleNameCandidate.toLowerCase()
        : "";

    // Prefer role name mapping so UI checks stay stable even if backend ids differ.
    if (roleName.includes("admin")) return ROLE_ADMIN;
    if (roleName.includes("expert")) return ROLE_EXPERT;
    if (roleName.includes("user")) return ROLE_USER;

    const roleId =
      typeof roleObj.id === "number"
        ? roleObj.id
        : typeof roleObj.id === "string"
          ? Number(roleObj.id)
          : NaN;
    if (!Number.isNaN(roleId)) {
      if (roleId === ROLE_ADMIN.id) return ROLE_ADMIN;
      if (roleId === ROLE_EXPERT.id) return ROLE_EXPERT;
      if (roleId === ROLE_USER.id) return ROLE_USER;
    }
  }

  if (typeof raw === "string") {
    const value = raw.toLowerCase().trim();
    if (value.includes("admin")) return ROLE_ADMIN;
    if (value.includes("expert")) return ROLE_EXPERT;
    return ROLE_USER;
  }
  return ROLE_USER;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = `${base64}${"=".repeat(padLen)}`;
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveRole(candidates: unknown[]): UserRole {
  const normalized = candidates.map((candidate) => normalizeRole(candidate));
  if (normalized.some((role) => role.id === ROLE_ADMIN.id)) return ROLE_ADMIN;
  if (normalized.some((role) => role.id === ROLE_EXPERT.id)) return ROLE_EXPERT;
  return ROLE_USER;
}

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
    return parsed.map((storedUser) => ({
      ...storedUser,
      role: normalizeRole(storedUser.role),
    }));
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
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    return {
      ...parsed,
      role: normalizeRole(parsed.role),
    };
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

function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthTokens | null) {
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKENS_KEY);
  }
}

function saveUserWithToken(user: User | null, tokens: AuthTokens | null) {
  if (!user || !tokens?.accessToken) {
    localStorage.removeItem(AUTH_USER_WITH_TOKEN_KEY);
    return;
  }

  localStorage.setItem(
    AUTH_USER_WITH_TOKEN_KEY,
    JSON.stringify({
      ...user,
      token: tokens.accessToken,
    }),
  );
}

export function hasValidAccessToken(tokens: AuthTokens | null): boolean {
  if (!tokens?.accessToken) return false;

  const accessTokenExpiry = Date.parse(tokens.accessTokenExpiresAt);
  if (Number.isNaN(accessTokenExpiry)) return false;

  return accessTokenExpiry > Date.now();
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession());
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getTokens());

  // Keep localStorage in sync
  useEffect(() => {
    saveSession(user);
  }, [user]);

  useEffect(() => {
    saveTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    saveUserWithToken(user, tokens);
  }, [user, tokens]);

  /** Returns LoginResult with error (null on success) and redirectTo path. */
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        const res = await loginUser({ email, password });
        const accessToken = res.accessToken ?? res.token ?? "";
        const accessTokenExpiresAt = res.accessTokenExpiresAt ?? res.expiresAt ?? "";
        if (!accessToken || !accessTokenExpiresAt) {
          return { error: "Login response is missing token information.", redirectTo: "/" };
        }
        const jwtPayload = decodeJwtPayload(accessToken);
        const resolvedRole = resolveRole([
          res.user.role,
          (res as unknown as Record<string, unknown>).role,
          (res as unknown as Record<string, unknown>).roleType,
          jwtPayload?.role,
          jwtPayload?.roles,
          jwtPayload?.authorities,
          jwtPayload?.scope,
        ]);

        const newUser: User = {
          userId: res.user.id,
          email: res.user.email,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          phone: res.user.mobileNumber ?? "",
          role: resolvedRole,
        };

        const newTokens: AuthTokens = {
          accessToken,
          accessTokenExpiresAt,
          refreshToken: res.refreshToken ?? "",
          refreshTokenExpiresAt: res.refreshTokenExpiresAt ?? "",
        };

        setUser(newUser);
        setTokens(newTokens);
        return { error: null, redirectTo: getDashboardPath(resolvedRole) };
      } catch (err) {
        if (err instanceof ApiError) {
          return { error: err.message, redirectTo: "/" };
        }
        return { error: "Something went wrong. Please try again.", redirectTo: "/" };
      }
    },
    [],
  );

  /** Returns LoginResult — same shape as login() — so callers can redirect appropriately. */
  const register = useCallback(async (data: RegisterData): Promise<LoginResult> => {
    if (data.password !== data.confirmPassword) return { error: "Passwords do not match.", redirectTo: "/" };
    if (data.password.length < 6) return { error: "Password must be at least 6 characters.", redirectTo: "/" };

    try {
      const payload: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        countryCode: data.countryCode,
        mobileNumber: data.mobileNumber,
      };

      const res = await registerUser(payload);

      // Store tokens
      setTokens(res.tokens);

      // Build the local user object
      const rawRole = (res as unknown as Record<string, unknown>).role ??
        (res as unknown as Record<string, unknown>).roleType;

      const newUser: User = {
        userId: res.userId,
        email: res.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.mobileNumber
          ? `${data.countryCode} ${data.mobileNumber}`.trim()
          : "",
        role: normalizeRole(rawRole),
      };

      setUser(newUser);
      return { error: null, redirectTo: getDashboardPath(newUser.role) };
    } catch (err) {
      if (err instanceof ApiError) {
        return { error: err.message, redirectTo: "/" };
      }
      return { error: "Something went wrong. Please try again.", redirectTo: "/" };
    }
  }, []);

  /** Update the current user's profile. Returns error string or null on success. */
  const updateUser = useCallback(
    (data: UpdateProfileData): string | null => {
      if (!user) return "You must be logged in to update your profile.";

      const users = getStoredUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx === -1) return "User not found.";

      users[idx] = { ...users[idx], ...data };
      saveStoredUsers(users);

      const { password: _, ...safe } = users[idx];
      setUser(safe);
      return null;
    },
    [user],
  );

  /** Sync-update display name in React state + localStorage after a real API PUT /users/me. */
  const updateAuthUser = useCallback(
    (update: { firstName?: string; lastName?: string }) => {
      setUser((prev) => (prev ? { ...prev, ...update } : prev));
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
  }, []);

  const value = useMemo(
    () => ({ user, tokens, login, register, updateUser, updateAuthUser, logout }),
    [user, tokens, login, register, updateUser, updateAuthUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
