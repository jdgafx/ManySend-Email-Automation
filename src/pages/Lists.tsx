import { useState } from 'react';
import { Plus, ListChecks, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLists, useCreateList, useDeleteList } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const listSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type ListForm = z.infer<typeof listSchema>;

export default function Lists() {
  const [createOpen, setCreateOpen] = useState(false);
  const lists = useLists({ pageSize: '100' });
  const createList = useCreateList();
  const deleteList = useDeleteList();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ListForm>({
    resolver: zodResolver(listSchema),
  });

  const onCreateSubmit = async (data: ListForm) => {
    await createList.mutateAsync(data);
    setCreateOpen(false);
    reset();
  };

  if (lists.isLoading) return <LoadingState />;
  if (lists.isError) return <ErrorState onRetry={() => lists.refetch()} />;

  const items = lists.data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mailing Lists"
        description="Organize your prospects into targeted lists"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New List
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={ListChecks} title="No lists yet" description="Create mailing lists to organize your prospects." actionLabel="Create List" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((list) => (
            <Card key={list.id} className="group relative overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <ListChecks className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{list.title}</CardTitle>
                      {list.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{list.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => deleteList.mutate(list.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {list.prospectsCount} prospects
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(list.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create List</DialogTitle>
            <DialogDescription>Create a new mailing list to organize prospects.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">List Name</Label>
              <Input id="title" {...register('title')} placeholder="e.g. SaaS Founders" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea {...register('description')} placeholder="What is this list for?" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createList.isPending}>
                {createList.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
