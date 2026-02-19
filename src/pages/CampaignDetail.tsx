import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Mail, Eye, MousePointer, MessageSquare, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { CampaignStatusBadge } from '@/components/shared/StatusBadge';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCampaign, useCampaignStats, useSequences, useCreateSequence, useStartCampaign, usePauseCampaign } from '@/hooks/useApi';
import { formatPercent } from '@/lib/utils';
import { SequenceEditor } from '@/components/shared/SequenceEditor';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const [createSeqOpen, setCreateSeqOpen] = useState(false);
  const [seqName, setSeqName] = useState('');

  const campaign = useCampaign(campaignId);
  const stats = useCampaignStats(campaignId);
  const sequences = useSequences(campaignId);
  const createSequence = useCreateSequence(campaignId);
  const startCampaign = useStartCampaign();
  const pauseCampaign = usePauseCampaign();

  if (campaign.isLoading) return <LoadingState />;
  if (campaign.isError) return <ErrorState onRetry={() => campaign.refetch()} />;
  if (!campaign.data) return <ErrorState message="Campaign not found" />;

  const c = campaign.data;
  const s = stats.data;
  const bounceRate = s ? s.bounceRate : 0;
  const highBounce = bounceRate > 0.02;

  const handleCreateSequence = async () => {
    if (!seqName.trim()) return;
    await createSequence.mutateAsync({ name: seqName });
    setSeqName('');
    setCreateSeqOpen(false);
  };

  return (
    <div className="space-y-6">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to Campaigns
      </Link>

      <PageHeader
        title={c.name}
        description={c.description}
        actions={
          <div className="flex items-center gap-3">
            <CampaignStatusBadge status={c.status} />
            {c.status === 'Active' ? (
              <Button variant="outline" onClick={() => pauseCampaign.mutate(campaignId)}>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button onClick={() => startCampaign.mutate(campaignId)}>
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            )}
          </div>
        }
      />

      {highBounce && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium">High bounce rate detected ({formatPercent(bounceRate)})</p>
            <p className="text-red-600">Pause this campaign and clean your prospect list to protect sender reputation.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard label="Sent" value={s?.sent || 0} icon={Mail} iconColor="text-blue-600" />
            <StatsCard label="Opens" value={s ? `${s.opened} (${formatPercent(s.openRate)})` : '—'} icon={Eye} iconColor="text-emerald-600" />
            <StatsCard label="Clicks" value={s ? `${s.clicked} (${formatPercent(s.clickRate)})` : '—'} icon={MousePointer} iconColor="text-amber-600" />
            <StatsCard label="Replies" value={s ? `${s.replied} (${formatPercent(s.replyRate)})` : '—'} icon={MessageSquare} iconColor="text-blue-600" />
            <StatsCard label="Bounces" value={s ? `${s.bounced} (${formatPercent(s.bounceRate)})` : '—'} icon={XCircle} iconColor="text-red-500" />
            <StatsCard label="Unsubscribed" value={s?.unsubscribed || 0} icon={AlertTriangle} iconColor="text-amber-600" />
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Email Sequences</h3>
            <Button onClick={() => setCreateSeqOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Sequence
            </Button>
          </div>

          {sequences.isLoading && <LoadingState />}
          {sequences.data && Array.isArray(sequences.data) && sequences.data.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No sequences yet. Create one to start building your email flow.</p>
              </CardContent>
            </Card>
          )}
          {sequences.data && Array.isArray(sequences.data) && sequences.data.map((seq) => (
            <SequenceEditor key={seq.id} sequence={seq} />
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input defaultValue={c.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input defaultValue={c.description || ''} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sending Window</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input type="time" defaultValue="08:00" />
                  <Input type="time" defaultValue="18:00" />
                </div>
                <p className="text-xs text-muted-foreground">Recommended: Mon-Fri, 8am-6pm in prospect's timezone</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createSeqOpen} onOpenChange={setCreateSeqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sequence</DialogTitle>
            <DialogDescription>Add a new email sequence to this campaign.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sequence Name</Label>
              <Input value={seqName} onChange={(e) => setSeqName(e.target.value)} placeholder="e.g. Main Sequence" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSeqOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSequence} disabled={createSequence.isPending}>
              {createSequence.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
