import { useState } from 'react';
import { Plus, Tag, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const tagSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type TagForm = z.infer<typeof tagSchema>;

export default function Tags() {
  const [createOpen, setCreateOpen] = useState(false);
  const tags = useTags({ pageSize: '100' });
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagForm>({
    resolver: zodResolver(tagSchema),
  });

  const onCreateSubmit = async (data: TagForm) => {
    await createTag.mutateAsync(data);
    setCreateOpen(false);
    reset();
  };

  if (tags.isLoading) return <LoadingState />;
  if (tags.isError) return <ErrorState onRetry={() => tags.refetch()} />;

  const items = tags.data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Organize and segment your prospects with tags"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Tag
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Tag} title="No tags yet" description="Create tags to organize and segment your prospects." actionLabel="Create Tag" onAction={() => setCreateOpen(true)} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Tag</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Prospects</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((tag) => (
                  <tr key={tag.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{tag.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{tag.description || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {tag.prospectCount}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteTag.mutate(tag.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>Tags help you organize and segment prospects.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tag Name</Label>
              <Input id="title" {...register('title')} placeholder="e.g. Decision Maker" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea {...register('description')} placeholder="What does this tag represent?" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTag.isPending}>
                {createTag.isPending ? 'Creating...' : 'Create Tag'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
