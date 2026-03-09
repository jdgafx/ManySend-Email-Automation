import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoMark({ className, size = 'md' }: LogoMarkProps) {
  const dims = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-14 w-14' }[size];
  const iconDims = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8' }[size];
  return (
    <div
      className={cn(
        dims,
        'relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-500/30 ring-1 ring-white/10',
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className={iconDims}>
        <path
          d="M12 3L8 7.5M12 3L16 7.5M12 3V12"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 9L12 15L21 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 10V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V10"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface LogoFullProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'login';
  className?: string;
}

export function LogoFull({ collapsed, variant = 'sidebar', className }: LogoFullProps) {
  if (variant === 'login') {
    return (
      <div className={cn('flex flex-col items-center gap-5', className)}>
        <LogoMark size="lg" />
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(99,102,241,0.3)]">
            PME MASTER
          </h1>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-400/60" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white">
                Cold Email Campaign
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-400/60" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-indigo-300">
              &amp; LeadGen Engine
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size="sm" />
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[13px] font-extrabold tracking-tight text-white">
            PME MASTER
          </span>
          <span className="mt-0.5 text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-indigo-300/90">
            Cold Email Campaign
          </span>
          <span className="text-[7.5px] font-extrabold uppercase tracking-[0.12em] text-indigo-400/70">
            &amp; LeadGen Engine
          </span>
        </div>
      )}
    </div>
  );
}
