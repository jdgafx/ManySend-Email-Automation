import { useState } from 'react';
import { Search, Plus, Users, Trash2, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProspectStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useProspects, useCreateProspect, useDeleteProspect } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const prospectSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  linkedIn: z.string().optional(),
});

type ProspectForm = z.infer<typeof prospectSchema>;

export default function Prospects() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  const prospects = useProspects({ page: String(page), pageSize: '50', search: search || undefined });
  const createProspect = useCreateProspect();
  const deleteProspect = useDeleteProspect();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProspectForm>({
    resolver: zodResolver(prospectSchema),
  });

  const onCreateSubmit = async (data: ProspectForm) => {
    await createProspect.mutateAsync(data);
    setCreateOpen(false);
    reset();
  };

  if (prospects.isLoading) return <LoadingState />;
  if (prospects.isError) return <ErrorState onRetry={() => prospects.refetch()} />;

  const items = (prospects.data?.items || [])
    .filter((p) => statusFilter === 'all' || p.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospects"
        description={`${prospects.data?.totalRecords || 0} prospects total`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Prospect
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by email, name, company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Interested">Interested</SelectItem>
            <SelectItem value="NotInterested">Not Interested</SelectItem>
            <SelectItem value="MaybeLater">Maybe Later</SelectItem>
            <SelectItem value="MeetingBooked">Meeting Booked</SelectItem>
            <SelectItem value="Won">Won</SelectItem>
            <SelectItem value="BounceHard">Hard Bounce</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Users} title="No prospects found" description="Add prospects to start your outreach campaigns." actionLabel="Add Prospect" onAction={() => setCreateOpen(true)} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tags</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((prospect) => (
                  <tr key={prospect.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium">{prospect.email}</td>
                    <td className="px-6 py-4 text-sm">{[prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{prospect.company || '—'}</td>
                    <td className="px-6 py-4"><ProspectStatusBadge status={prospect.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {prospect.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-[10px]">{tag.title}</Badge>
                        ))}
                        {(prospect.tags?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{(prospect.tags?.length || 0) - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteProspect.mutate(prospect.id)} className="text-destructive">
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

      {(prospects.data?.totalRecords || 0) > 50 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Prospect</DialogTitle>
            <DialogDescription>Add a new prospect to your outreach list.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" {...register('email')} placeholder="john@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...register('lastName')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input {...register('company')} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...register('title')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input {...register('linkedIn')} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input {...register('website')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProspect.isPending}>
                {createProspect.isPending ? 'Adding...' : 'Add Prospect'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
