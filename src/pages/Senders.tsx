import { useState } from 'react';
import { Plus, Send, AlertTriangle, Shield, Trash2, Wifi, WifiOff } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSenders, useCreateSender, useDeleteSender } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const senderSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  smtpHost: z.string().min(1, 'SMTP host required'),
  smtpPort: z.number().min(1),
  smtpUsername: z.string().min(1, 'SMTP username required'),
  smtpPassword: z.string().min(1, 'SMTP password required'),
  imapHost: z.string().optional(),
  imapPort: z.number().optional(),
  imapUsername: z.string().optional(),
  imapPassword: z.string().optional(),
  dailyLimit: z.number().min(1),
  warmupEnabled: z.boolean(),
});

type SenderForm = z.output<typeof senderSchema>;

export default function Senders() {
  const [createOpen, setCreateOpen] = useState(false);
  const senders = useSenders({ pageSize: '100' });
  const createSender = useCreateSender();
  const deleteSender = useDeleteSender();

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<SenderForm>({
    resolver: zodResolver(senderSchema),
    defaultValues: { dailyLimit: 50, warmupEnabled: true, smtpPort: 587 },
  });

  const warmupEnabled = watch('warmupEnabled');

  const onCreateSubmit = async (data: SenderForm) => {
    await createSender.mutateAsync(data);
    setCreateOpen(false);
    reset();
  };

  if (senders.isLoading) return <LoadingState />;
  if (senders.isError) return <ErrorState onRetry={() => senders.refetch()} />;

  const items = senders.data?.items || [];
  const noWarmupCount = items.filter((s) => !s.warmupEnabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sender Accounts"
        description="Manage your email sending accounts and warmup status"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Sender
          </Button>
        }
      />

      {noWarmupCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-medium">{noWarmupCount} sender{noWarmupCount > 1 ? 's' : ''} ha{noWarmupCount > 1 ? 've' : 's'} warmup disabled</p>
            <p className="text-amber-700">Enable warmup to protect your sender reputation and improve deliverability.</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Send} title="No sender accounts" description="Add your email accounts to start sending campaigns." actionLabel="Add Sender" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((sender) => {
            const utilization = sender.dailyLimit > 0 ? (sender.currentDailyCount / sender.dailyLimit) * 100 : 0;
            return (
              <Card key={sender.id} className="group relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-3 w-3 rounded-full', sender.errorCount > 0 ? 'bg-red-500' : 'bg-emerald-500')} />
                      <div>
                        <p className="font-medium">{sender.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {[sender.firstName, sender.lastName].filter(Boolean).join(' ')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => deleteSender.mutate(sender.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        {sender.warmupEnabled ? (
                          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        Warmup
                      </span>
                      <Badge variant={sender.warmupEnabled ? 'success' : 'warning'}>
                        {sender.warmupEnabled ? 'ON' : 'OFF'}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Daily Usage</span>
                        <span className="font-medium">{sender.currentDailyCount} / {sender.dailyLimit}</span>
                      </div>
                      <Progress value={utilization} className={cn(utilization > 80 && '[&>div]:bg-amber-500', utilization > 95 && '[&>div]:bg-red-500')} />
                    </div>

                    {sender.errorCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        {sender.errorCount} error{sender.errorCount > 1 ? 's' : ''}
                      </div>
                    )}

                    {sender.folder && (
                      <p className="text-xs text-muted-foreground">Folder: {sender.folder}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Sender Account</DialogTitle>
            <DialogDescription>Connect an email account for sending campaigns.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input {...register('email')} placeholder="you@company.com" />
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
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> SMTP Settings</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>Host</Label>
                  <Input {...register('smtpHost')} placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input type="number" {...register('smtpPort')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input {...register('smtpUsername')} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...register('smtpPassword')} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Daily Sending Limit</Label>
                <p className="text-xs text-muted-foreground">Max emails per day from this account</p>
              </div>
              <Input type="number" className="w-24" {...register('dailyLimit')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Enable Warmup</Label>
                <p className="text-xs text-muted-foreground">Gradually increase sending reputation</p>
              </div>
              <Switch checked={warmupEnabled} onCheckedChange={(v) => setValue('warmupEnabled', v)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createSender.isPending}>
                {createSender.isPending ? 'Adding...' : 'Add Sender'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
