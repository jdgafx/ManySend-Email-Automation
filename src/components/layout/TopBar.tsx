import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doLogout, displayName, initials } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const name = displayName(user);
  const abbrev = initials(user);
  const avatarUrl = user.user_metadata?.avatar_url;

  async function handleLogout() {
    await doLogout();
    window.location.href = '/login';
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border/60 bg-background px-6">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition',
            'hover:bg-muted focus:outline-none'
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {abbrev}
            </span>
          )}
          <span className="max-w-[140px] truncate font-medium text-foreground">
            {name}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-border bg-popover py-1 shadow-lg">
            <div className="border-b border-border px-4 py-2.5">
              <p className="truncate text-xs font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
