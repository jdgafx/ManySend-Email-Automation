import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Users, ListChecks, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProspectStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { SpreadsheetImport } from '@/components/shared/SpreadsheetImport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useList, useListProspects } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import type { Prospect } from '@/types';

function downloadCSV(prospects: Prospect[], listTitle: string) {
  const headers = ['Email', 'First Name', 'Last Name', 'Company', 'Title', 'Phone', 'Website', 'LinkedIn', 'Status', 'Tags', 'Created'];
  const rows = prospects.map((p) => [
    p.email,
    p.firstName ?? '',
    p.lastName ?? '',
    p.company ?? '',
    p.title ?? '',
    p.phone ?? '',
    p.website ?? '',
    p.linkedIn ?? '',
    p.status,
    (p.tags ?? []).map((t) => t.title).join('; '),
    p.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${listTitle.replace(/[^a-zA-Z0-9]/g, '_')}_contacts.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const listId = Number(id) || 0;

  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const list = useList(listId);
  const prospects = useListProspects(listId, {
    page: String(page),
    pageSize: '50',
    search: search || undefined,
  });

  const handleDownloadCSV = useCallback(() => {
    const items = prospects.data?.items;
    if (!items || items.length === 0) return;
    downloadCSV(items, list.data?.title ?? 'list');
  }, [prospects.data?.items, list.data?.title]);

  if (list.isLoading || prospects.isLoading) return <LoadingState />;
  if (list.isError) return <ErrorState onRetry={() => list.refetch()} />;

  const listData = list.data;
  const items = prospects.data?.items ?? [];
  const totalRecords = prospects.data?.totalRecords ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/lists">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <PageHeader
            title={listData?.title ?? 'List'}
            description={
              listData?.description
                ? `${listData.description} — ${totalRecords} contacts`
                : `${totalRecords} contacts`
            }
            actions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadCSV}
                  disabled={items.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Import Spreadsheet
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
            <ListChecks className="h-4 w-4 text-indigo-400" />
          </div>
          {totalRecords} total
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts in this list"
          description="Import a spreadsheet to add contacts to this list."
          actionLabel="Import Spreadsheet"
          onAction={() => setImportOpen(true)}
        />
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
                  <th className="px-6 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((prospect) => (
                  <tr key={prospect.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium">{prospect.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {[prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {prospect.company || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <ProspectStatusBadge status={prospect.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {prospect.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-[10px]">
                            {tag.title}
                          </Badge>
                        ))}
                        {(prospect.tags?.length ?? 0) > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{(prospect.tags?.length ?? 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(prospect.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {totalRecords > 50 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(totalRecords / 50)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(totalRecords / 50)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <SpreadsheetImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        preselectedListId={listId}
      />
    </div>
  );
}
