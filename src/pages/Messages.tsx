import { useState } from 'react';
import { Inbox, Mail, MessageSquare, Send } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMessages } from '@/hooks/useApi';
import { formatDateTime } from '@/lib/utils';
import type { Message, MessageType } from '@/types';

export default function Messages() {
  const [tab, setTab] = useState<MessageType>('Sent');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const messages = useMessages({ type: tab, pageSize: '50' });

  const items = messages.data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="View sent emails, replies, and manual messages" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as MessageType)}>
        <TabsList>
          <TabsTrigger value="Sent" className="gap-2">
            <Send className="h-3 w-3" /> Sent
          </TabsTrigger>
          <TabsTrigger value="Reply" className="gap-2">
            <MessageSquare className="h-3 w-3" /> Replies
          </TabsTrigger>
          <TabsTrigger value="SentManual" className="gap-2">
            <Mail className="h-3 w-3" /> Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {messages.isLoading && <LoadingState />}
          {messages.isError && <ErrorState onRetry={() => messages.refetch()} />}
          {!messages.isLoading && !messages.isError && items.length === 0 && (
            <EmptyState icon={Inbox} title={`No ${tab.toLowerCase()} messages`} description="Messages will appear here once your campaigns start sending." />
          )}
          {items.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">From</th>
                      <th className="px-6 py-3">To</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Opens</th>
                      <th className="px-6 py-3">Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((msg) => (
                      <tr
                        key={msg.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        <td className="px-6 py-4 text-sm font-medium">{msg.subject || '(No subject)'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{msg.fromEmail}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{msg.toEmail}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{msg.sentAt ? formatDateTime(msg.sentAt) : '—'}</td>
                        <td className="px-6 py-4">
                          <Badge variant={msg.opens > 0 ? 'success' : 'secondary'}>{msg.opens}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={msg.clicks > 0 ? 'info' : 'secondary'}>{msg.clicks}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || '(No subject)'}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.fromEmail} &rarr; To: {selectedMessage?.toEmail}
              {selectedMessage?.sentAt && ` | ${formatDateTime(selectedMessage.sentAt)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {selectedMessage?.body ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />
            ) : (
              <p className="text-sm text-muted-foreground">No message body available</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={selectedMessage?.opens ? 'success' : 'secondary'}>{selectedMessage?.opens || 0} opens</Badge>
            <Badge variant={selectedMessage?.clicks ? 'info' : 'secondary'}>{selectedMessage?.clicks || 0} clicks</Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
