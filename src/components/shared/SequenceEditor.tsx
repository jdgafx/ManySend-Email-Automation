import { useState } from 'react';
import { Plus, Clock, ChevronDown, ChevronUp, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFollowups, useCreateFollowup, useUpdateFollowup, useDeleteFollowup } from '@/hooks/useApi';
import { LoadingState } from './LoadingState';
import type { Sequence, Followup } from '@/types';

const PERSONALIZATION_TOKENS = [
  { label: 'First Name', token: '{FirstName}' },
  { label: 'Last Name', token: '{LastName}' },
  { label: 'Company', token: '{Company}' },
  { label: 'Title', token: '{Title}' },
  { label: 'Email', token: '{Email}' },
  { label: 'Unsubscribe', token: '{Unsubscribe}' },
];

interface SequenceEditorProps {
  sequence: Sequence;
}

export function SequenceEditor({ sequence }: SequenceEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editFollowup, setEditFollowup] = useState<Followup | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayDays, setDelayDays] = useState(1);
  const [delayHours, setDelayHours] = useState(0);

  const followups = useFollowups(sequence.id);
  const createFollowup = useCreateFollowup(sequence.id);
  const updateFollowup = useUpdateFollowup(sequence.id);
  const deleteFollowup = useDeleteFollowup(sequence.id);

  const hasPersonalization = (text: string) =>
    PERSONALIZATION_TOKENS.some((t) => text.includes(t.token));

  const insertToken = (token: string) => {
    if (editFollowup) {
      setBody((prev) => prev + token);
    } else {
      setBody((prev) => prev + token);
    }
  };

  const handleCreate = async () => {
    await createFollowup.mutateAsync({ subject, body, delayDays, delayHours });
    setSubject('');
    setBody('');
    setDelayDays(1);
    setDelayHours(0);
    setCreateOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editFollowup) return;
    await updateFollowup.mutateAsync({
      followupId: editFollowup.id,
      data: { subject, body, delayDays, delayHours },
    });
    setEditFollowup(null);
  };

  const openEditDialog = (f: Followup) => {
    setEditFollowup(f);
    setSubject(f.subject);
    setBody(f.body);
    setDelayDays(f.delayDays);
    setDelayHours(f.delayHours);
  };

  const followupList = Array.isArray(followups.data) ? followups.data : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <CardTitle className="text-base">{sequence.name}</CardTitle>
          <Badge variant="secondary">{followupList.length} steps</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-3 w-3" /> Add Step
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {followups.isLoading && <LoadingState />}
          {followupList.length === 0 && !followups.isLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">No email steps yet. Add your first followup.</p>
          )}
          {followupList.map((f, idx) => (
            <div key={f.id} className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{f.subject || '(No subject)'}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {f.delayDays > 0 && `${f.delayDays}d`}
                    {f.delayHours > 0 && ` ${f.delayHours}h`}
                    {f.delayDays === 0 && f.delayHours === 0 && 'Immediate'}
                    {' delay'}
                  </span>
                  <Badge variant={f.isActive ? 'success' : 'secondary'} className="text-[10px]">
                    {f.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEditDialog(f)}>Edit</Button>
                <Button size="icon" variant="ghost" onClick={() => deleteFollowup.mutate(f.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}

      <Dialog open={createOpen || !!editFollowup} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setEditFollowup(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editFollowup ? 'Edit Email Step' : 'Add Email Step'}</DialogTitle>
            <DialogDescription>Configure the email content and delay for this step.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Quick question about {Company}" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Body</Label>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Insert:</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {PERSONALIZATION_TOKENS.map((t) => (
                  <button
                    key={t.token}
                    type="button"
                    onClick={() => insertToken(t.token)}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {t.token}
                  </button>
                ))}
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {FirstName}, ..."
                className="min-h-[200px] font-mono text-sm"
              />
              {body && !hasPersonalization(body) && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <Sparkles className="h-3 w-3" />
                  Adding personalization tokens reduces spam score and improves reply rates.
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delay (days)</Label>
                <Input type="number" min={0} value={delayDays} onChange={(e) => setDelayDays(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Delay (hours)</Label>
                <Input type="number" min={0} max={23} value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditFollowup(null); }}>Cancel</Button>
            <Button
              onClick={editFollowup ? handleSaveEdit : handleCreate}
              disabled={createFollowup.isPending || updateFollowup.isPending}
            >
              {editFollowup ? 'Save Changes' : 'Add Step'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
