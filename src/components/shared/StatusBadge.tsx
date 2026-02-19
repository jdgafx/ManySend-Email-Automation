import { Badge } from '@/components/ui/badge';
import type { CampaignStatus, ProspectStatus } from '@/types';

const campaignStatusConfig: Record<CampaignStatus, { variant: 'success' | 'warning' | 'secondary' | 'info'; label: string }> = {
  Active: { variant: 'success', label: 'Active' },
  Paused: { variant: 'warning', label: 'Paused' },
  Draft: { variant: 'secondary', label: 'Draft' },
  Completed: { variant: 'info', label: 'Completed' },
};

const prospectStatusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info'; label: string }> = {
  NotSet: { variant: 'secondary', label: 'Not Set' },
  Neutral: { variant: 'secondary', label: 'Neutral' },
  Interested: { variant: 'success', label: 'Interested' },
  NotInterested: { variant: 'destructive', label: 'Not Interested' },
  MaybeLater: { variant: 'warning', label: 'Maybe Later' },
  MeetingBooked: { variant: 'success', label: 'Meeting Booked' },
  MeetingCompleted: { variant: 'info', label: 'Meeting Done' },
  Won: { variant: 'success', label: 'Won' },
  BounceHard: { variant: 'destructive', label: 'Hard Bounce' },
  BounceSoft: { variant: 'warning', label: 'Soft Bounce' },
  Unsub: { variant: 'warning', label: 'Unsubscribed' },
  Blacklisted: { variant: 'destructive', label: 'Blacklisted' },
  Stopped: { variant: 'secondary', label: 'Stopped' },
  AutoReply: { variant: 'info', label: 'Auto Reply' },
  AutoOoo: { variant: 'info', label: 'Out of Office' },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const config = campaignStatusConfig[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProspectStatusBadge({ status }: { status: ProspectStatus }) {
  const config = prospectStatusConfig[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
