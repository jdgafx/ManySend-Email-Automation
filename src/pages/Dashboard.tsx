import { Link } from 'react-router-dom';
import { Mail, Users, Send, Activity, Plus, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { HealthScore } from '@/components/shared/HealthScore';
import { CampaignStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaigns, useSenders, useProspects } from '@/hooks/useApi';
import { formatDate, calculateHealthScore, formatNumber } from '@/lib/utils';

export default function Dashboard() {
  const campaigns = useCampaigns({ pageSize: '50' });
  const senders = useSenders({ pageSize: '50' });
  const prospects = useProspects({ pageSize: '1' });

  const isLoading = campaigns.isLoading || senders.isLoading || prospects.isLoading;
  const isError = campaigns.isError || senders.isError || prospects.isError;

  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={() => { campaigns.refetch(); senders.refetch(); prospects.refetch(); }} />;

  const campaignList = campaigns.data?.items || [];
  const senderList = senders.data?.items || [];
  const activeCampaigns = campaignList.filter((c) => c.status === 'Active').length;
  const totalProspects = prospects.data?.totalRecords || 0;
  const warmupActive = senderList.some((s) => s.warmupEnabled);

  const healthScore = calculateHealthScore({
    hasWarmupActive: warmupActive,
    avgBounceRate: 0.01,
    usesPersonalization: true,
    hasSendingWindow: true,
  });

  const recentCampaigns = campaignList.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your cold email outreach"
        actions={
          <Link to="/campaigns">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Campaigns"
          value={formatNumber(campaigns.data?.totalRecords || 0)}
          icon={Mail}
          iconColor="text-blue-600"
        />
        <StatsCard
          label="Active Campaigns"
          value={activeCampaigns}
          icon={Activity}
          iconColor="text-emerald-600"
        />
        <StatsCard
          label="Total Prospects"
          value={formatNumber(totalProspects)}
          icon={Users}
          iconColor="text-amber-600"
        />
        <StatsCard
          label="Sender Accounts"
          value={senderList.length}
          icon={Send}
          iconColor="text-blue-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Campaigns</CardTitle>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No campaigns yet</p>
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(campaign.createdAt)}</p>
                      </div>
                    </div>
                    <CampaignStatusBadge status={campaign.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deliverability Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <HealthScore score={healthScore} />
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Warmup Active</span>
                <span className={warmupActive ? 'text-emerald-600' : 'text-red-500'}>
                  {warmupActive ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sender Accounts</span>
                <span>{senderList.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Campaigns</span>
                <span>{activeCampaigns}</span>
              </div>
            </div>
            {!warmupActive && senderList.length > 0 && (
              <div className="w-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Enable warmup on your senders to protect reputation
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
