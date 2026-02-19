import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Play, Pause, Copy, Trash2, MoreHorizontal, Mail } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { CampaignStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCampaigns, useCreateCampaign, useDeleteCampaign, useStartCampaign, usePauseCampaign, useCopyCampaign } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CampaignForm = z.infer<typeof campaignSchema>;

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const campaigns = useCampaigns({ pageSize: '100' });
  const createCampaign = useCreateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const pauseCampaign = usePauseCampaign();
  const copyCampaign = useCopyCampaign();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
  });

  const onCreateSubmit = async (data: CampaignForm) => {
    const result = await createCampaign.mutateAsync(data);
    setCreateOpen(false);
    reset();
    navigate(`/campaigns/${result.id}`);
  };

  if (campaigns.isLoading) return <LoadingState />;
  if (campaigns.isError) return <ErrorState onRetry={() => campaigns.refetch()} />;

  const items = (campaigns.data?.items || [])
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description={`${campaigns.data?.totalRecords || 0} campaigns total`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No campaigns found"
          description="Create your first cold email campaign to start reaching prospects."
          actionLabel="Create Campaign"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((campaign) => (
                  <tr key={campaign.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <Link to={`/campaigns/${campaign.id}`} className="font-medium hover:text-primary">
                        {campaign.name}
                      </Link>
                      {campaign.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{campaign.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {campaign.status === 'Active' ? (
                            <DropdownMenuItem onClick={() => pauseCampaign.mutate(campaign.id)}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => startCampaign.mutate(campaign.id)}>
                              <Play className="mr-2 h-4 w-4" /> Start
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => copyCampaign.mutate({ id: campaign.id, name: `${campaign.name} (Copy)` })}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteCampaign.mutate(campaign.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Set up a new cold email outreach campaign.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" {...register('name')} placeholder="e.g. Q1 SaaS Outreach" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" {...register('description')} placeholder="Brief description of this campaign" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
