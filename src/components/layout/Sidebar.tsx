import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Users,
  ListChecks,
  Send,
  Inbox,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoFull } from '@/components/shared/Logo';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campaigns', icon: Mail, label: 'Campaigns' },
  { to: '/prospects', icon: Users, label: 'Prospects' },
  { to: '/lists', icon: ListChecks, label: 'Lists' },
  { to: '/senders', icon: Send, label: 'Senders' },
  { to: '/messages', icon: Inbox, label: 'Messages' },
  { to: '/tags', icon: Tag, label: 'Tags' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-zinc-950 text-zinc-300 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b border-zinc-800 px-3">
        <LogoFull collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <div className="border-t border-zinc-800 p-4">
        {!collapsed && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-500">Powered by PrimeMarketingExperts.com</p>
            <p className="text-[10px] leading-snug text-zinc-600">
              Created by Christopher Gentile
              <br />
              CGDarkstardev1 · New Dawn AI
              <br />
              for PrimeMarketingExperts.com
              <br />
              Family of Companies
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
