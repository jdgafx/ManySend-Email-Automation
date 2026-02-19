declare module 'netlify-identity-widget' {
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
    confirmed_at?: string;
    created_at: string;
    updated_at: string;
    token?: {
      access_token: string;
      expires_in: number;
      expires_at: number;
      refresh_token: string;
      token_type: string;
    };
  }

  type EventName = 'init' | 'login' | 'logout' | 'error' | 'open' | 'close';

  interface InitOptions {
    container?: string;
    APIUrl?: string;
    locale?: string;
  }

  export function init(opts?: InitOptions): void;
  export function open(tab?: 'login' | 'signup'): void;
  export function close(): void;
  export function logout(): void;
  export function currentUser(): User | null;
  export function on(event: EventName, cb: (data?: unknown) => void): void;
  export function off(event: EventName, cb?: (data?: unknown) => void): void;
  export function refresh(force?: boolean): Promise<string>;
  export const store: { user: User | null };
}
