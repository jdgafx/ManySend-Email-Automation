const GOTRUE = '/.netlify/identity';
const USER_KEY = 'manysend.user';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
  app_metadata: {
    provider?: string;
    roles?: string[];
  };
  token: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

export type AuthChangeCallback = (user: User | null) => void;

const listeners: AuthChangeCallback[] = [];

function emit(user: User | null) {
  listeners.forEach((cb) => cb(user));
}

export function onAuthChange(cb: AuthChangeCallback) {
  listeners.push(cb);
}

export function storedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persist(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emit(user);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  emit(null);
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<User> {
  const res = await fetch(`${GOTRUE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      username: email,
      password,
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error_description?: string };
    throw new Error(err.error_description ?? 'Invalid email or password');
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: Omit<User, 'token'>;
  };

  const user: User = {
    ...data.user,
    token: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    },
  };
  persist(user);
  return user;
}

export function loginWithOAuth(provider: 'google' | 'github') {
  const redirectTo = encodeURIComponent(window.location.origin + '/');
  window.location.href = `${GOTRUE}/authorize?provider=${provider}&redirect_to=${redirectTo}`;
}

export async function handleOAuthCallback(): Promise<User | null> {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  history.replaceState({}, '', window.location.pathname);

  const res = await fetch(`${GOTRUE}/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as Omit<User, 'token'>;
  const user: User = {
    ...data,
    token: {
      access_token: accessToken,
      refresh_token: params.get('refresh_token') ?? '',
      expires_in: Number(params.get('expires_in') ?? 3600),
      token_type: 'bearer',
    },
  };
  persist(user);
  return user;
}

export async function doLogout() {
  const user = storedUser();
  if (user?.token.access_token) {
    await fetch(`${GOTRUE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token.access_token}` },
    }).catch(() => {});
  }
  clearUser();
}

export function getAccessToken(): string | null {
  return storedUser()?.token.access_token ?? null;
}

export function displayName(user: User): string {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email.split('@')[0]
  );
}

export function initials(user: User): string {
  const name = displayName(user);
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
