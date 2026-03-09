import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
  iconColor?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, className, iconColor = 'text-indigo-400' }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn('text-xs font-medium', trend.positive ? 'text-emerald-400' : 'text-red-500')}>
                {trend.positive ? '+' : ''}{trend.value}% from last period
              </p>
            )}
          </div>
          <div className={cn('rounded-xl bg-indigo-500/10 p-3', iconColor === 'text-emerald-400' && 'bg-emerald-500/10', iconColor === 'text-amber-400' && 'bg-amber-500/10', iconColor === 'text-red-500' && 'bg-red-500/10')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
