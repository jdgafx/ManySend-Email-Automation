import { cn, getHealthColor, getHealthBg } from '@/lib/utils';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'lg';
}

export function HealthScore({ score, size = 'lg' }: HealthScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const dimension = size === 'lg' ? 140 : 80;
  const fontSize = size === 'lg' ? 'text-3xl' : 'text-lg';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dimension} height={dimension} className="-rotate-90">
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'lg' ? 8 : 5}
          className="text-muted/50"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'lg' ? 8 : 5}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-1000', getHealthBg(score).replace('bg-', 'text-'))}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-display font-bold', fontSize, getHealthColor(score))}>
          {score}
        </span>
        {size === 'lg' && (
          <span className="text-xs text-muted-foreground">/ 100</span>
        )}
      </div>
    </div>
  );
}
