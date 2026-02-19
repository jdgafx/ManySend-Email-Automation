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

export function StatsCard({ label, value, icon: Icon, trend, className, iconColor = 'text-blue-600' }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
                {trend.positive ? '+' : ''}{trend.value}% from last period
              </p>
            )}
          </div>
          <div className={cn('rounded-xl bg-blue-50 p-3', iconColor === 'text-emerald-600' && 'bg-emerald-50', iconColor === 'text-amber-600' && 'bg-amber-50', iconColor === 'text-red-500' && 'bg-red-50')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
