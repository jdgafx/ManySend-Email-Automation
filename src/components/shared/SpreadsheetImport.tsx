import { useState, useCallback, useRef } from 'react';
import { Upload, ChevronRight, ChevronLeft, Check, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import {
  parseSpreadsheetFile,
  applyMapping,
  PROSPECT_FIELD_LABELS,
  type ParsedSpreadsheet,
  type ColumnMapping,
  type ProspectField,
} from '@/lib/spreadsheet';
import { useLists, useCampaigns, useBulkImportProspects } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProspectImport } from '@/types';

const BATCH_SIZE = 100;
const STEPS = ['Upload', 'Map Columns', 'Configure', 'Results'] as const;
type Step = 0 | 1 | 2 | 3;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SpreadsheetImport({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [listId, setListId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [addOnlyIfNew, setAddOnlyIfNew] = useState(false);
  const [notInOtherCampaign, setNotInOtherCampaign] = useState(false);
  const [parseError, setParseError] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ProspectImport | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lists = useLists({ pageSize: '200' });
  const campaigns = useCampaigns({ pageSize: '200' });
  const bulkImport = useBulkImportProspects();

  function reset() {
    setStep(0);
    setParsed(null);
    setMapping({});
    setListId('');
    setCampaignId('');
    setAddOnlyIfNew(false);
    setNotInOtherCampaign(false);
    setParseError('');
    setImportProgress(0);
    setImportResult(null);
    setImportError('');
  }

  const handleFile = useCallback(async (file: File) => {
    setParseError('');
    try {
      const result = await parseSpreadsheetFile(file);
      setParsed(result);
      setMapping(result.detectedMapping);
      setStep(1);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file.');
    }
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function runImport() {
    if (!parsed || !listId) return;
    setStep(3);
    setImportProgress(0);
    setImportError('');

    const prospects = applyMapping(parsed.rows, mapping);
    const batches: typeof prospects[] = [];
    for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
      batches.push(prospects.slice(i, i + BATCH_SIZE));
    }

    const accumulated: ProspectImport = {
      totalProcessed: 0,
      prospectsInserted: 0,
      prospectsUpdated: 0,
      duplicatesInBatch: 0,
      subscriptionsAdded: 0,
      campaignAdded: 0,
    };

    try {
      for (let i = 0; i < batches.length; i++) {
        const result = await bulkImport.mutateAsync({
          prospects: batches[i],
          listId: Number(listId),
          campaignId: campaignId ? Number(campaignId) : undefined,
          addOnlyIfNew,
          notInOtherCampaign,
        });
        accumulated.totalProcessed += result.totalProcessed;
        accumulated.prospectsInserted += result.prospectsInserted;
        accumulated.prospectsUpdated += result.prospectsUpdated;
        accumulated.duplicatesInBatch += result.duplicatesInBatch;
        accumulated.subscriptionsAdded += result.subscriptionsAdded;
        accumulated.campaignAdded += result.campaignAdded;
        setImportProgress(Math.round(((i + 1) / batches.length) * 100));
      }
      setImportResult(accumulated);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  const mappedEmailRows = parsed
    ? applyMapping(parsed.rows, mapping).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Prospects from Spreadsheet</DialogTitle>
        </DialogHeader>

        <StepIndicator current={step} />

        <div className="mt-4 min-h-[320px]">
          {step === 0 && (
            <UploadStep
              onDrop={onDrop}
              onFileInput={onFileInput}
              fileInputRef={fileInputRef}
              error={parseError}
            />
          )}

          {step === 1 && parsed && (
            <MapStep
              parsed={parsed}
              mapping={mapping}
              onMappingChange={setMapping}
            />
          )}

          {step === 2 && parsed && (
            <ConfigureStep
              lists={lists.data?.items ?? []}
              campaigns={campaigns.data?.items ?? []}
              listId={listId}
              campaignId={campaignId}
              addOnlyIfNew={addOnlyIfNew}
              notInOtherCampaign={notInOtherCampaign}
              mappedEmailRows={mappedEmailRows}
              totalRows={parsed.totalRows}
              onListId={setListId}
              onCampaignId={setCampaignId}
              onAddOnlyIfNew={setAddOnlyIfNew}
              onNotInOtherCampaign={setNotInOtherCampaign}
            />
          )}

          {step === 3 && (
            <ResultsStep
              progress={importProgress}
              result={importResult}
              error={importError}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {step > 0 && step < 3 && (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 3 && (
              <Button variant="ghost" onClick={() => { reset(); onClose(); }}>
                Cancel
              </Button>
            )}
            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                disabled={!mapping.email}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={runImport} disabled={!listId || mappedEmailRows === 0}>
                Import {mappedEmailRows} prospects
              </Button>
            )}
            {step === 3 && importResult && (
              <Button onClick={() => { reset(); onClose(); }}>
                <Check className="mr-2 h-4 w-4" /> Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                i < current
                  ? 'bg-blue-600 text-white'
                  : i === current
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                i === current ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mx-3 h-px w-8 flex-shrink-0 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

function UploadStep({
  onDrop,
  onFileInput,
  fileInputRef,
  error,
}: {
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  error: string;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors',
          dragging
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-border hover:border-blue-400 hover:bg-muted/30'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Drop your spreadsheet here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse — CSV, XLSX, XLS supported
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv"
          className="hidden"
          onChange={onFileInput}
        />
      </div>
      {error && (
        <div className="flex w-full items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

function MapStep({
  parsed,
  mapping,
  onMappingChange,
}: {
  parsed: ParsedSpreadsheet;
  mapping: ColumnMapping;
  onMappingChange: (m: ColumnMapping) => void;
}) {
  const fields = Object.keys(PROSPECT_FIELD_LABELS) as ProspectField[];

  function setField(field: ProspectField, col: string) {
    onMappingChange({ ...mapping, [field]: col === '__none__' ? undefined : col });
  }

  const sampleRows = parsed.rows.slice(0, 3);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {parsed.totalRows} rows detected. Review the auto-detected column mappings below.
        {!mapping.email && (
          <span className="ml-1 font-medium text-amber-500">Email column required.</span>
        )}
      </p>
      <div className="max-h-[340px] overflow-y-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b bg-muted/80 backdrop-blur">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Field
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Spreadsheet Column
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sample Values
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field) => {
              const col = mapping[field];
              const samples = col
                ? sampleRows
                    .map((r) => r[col])
                    .filter(Boolean)
                    .slice(0, 2)
                : [];
              const isEmail = field === 'email';
              return (
                <tr
                  key={field}
                  className={cn(
                    'transition-colors',
                    isEmail && !col ? 'bg-amber-500/5' : ''
                  )}
                >
                  <td className="px-4 py-2.5 font-medium">
                    {PROSPECT_FIELD_LABELS[field]}
                    {isEmail && <span className="ml-1 text-xs text-destructive">*</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <Select
                      value={col ?? '__none__'}
                      onValueChange={(v) => setField(field, v)}
                    >
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue placeholder="— Not mapped —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Not mapped —</SelectItem>
                        {parsed.headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {samples.length > 0 ? samples.join(', ') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfigureStep({
  lists,
  campaigns,
  listId,
  campaignId,
  addOnlyIfNew,
  notInOtherCampaign,
  mappedEmailRows,
  totalRows,
  onListId,
  onCampaignId,
  onAddOnlyIfNew,
  onNotInOtherCampaign,
}: {
  lists: { id: number; title: string }[];
  campaigns: { id: number; name: string }[];
  listId: string;
  campaignId: string;
  addOnlyIfNew: boolean;
  notInOtherCampaign: boolean;
  mappedEmailRows: number;
  totalRows: number;
  onListId: (v: string) => void;
  onCampaignId: (v: string) => void;
  onAddOnlyIfNew: (v: boolean) => void;
  onNotInOtherCampaign: (v: boolean) => void;
}) {
  const skipped = totalRows - mappedEmailRows;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="font-semibold text-blue-500">{mappedEmailRows}</span> prospects will be imported
        {skipped > 0 && (
          <span className="text-muted-foreground">, {skipped} rows skipped (no valid email)</span>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Target List <span className="text-destructive">*</span>
        </label>
        <Select value={listId} onValueChange={onListId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a mailing list…" />
          </SelectTrigger>
          <SelectContent>
            {lists.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Add to Campaign (optional)</label>
        <Select value={campaignId} onValueChange={onCampaignId}>
          <SelectTrigger>
            <SelectValue placeholder="No campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No campaign</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Toggle
          checked={addOnlyIfNew}
          onChange={onAddOnlyIfNew}
          label="Add only if new"
          description="Skip prospects already in the system"
        />
        <Toggle
          checked={notInOtherCampaign}
          onChange={onNotInOtherCampaign}
          label="Not in other campaign"
          description="Only add prospects not enrolled in any other campaign"
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition hover:bg-muted/40"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </div>
    </button>
  );
}

function ResultsStep({
  progress,
  result,
  error,
}: {
  progress: number;
  result: ProspectImport | null;
  error: string;
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <X className="h-7 w-7 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Import failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Importing…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Processing your prospects in batches…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
        <Check className="h-7 w-7 text-green-500" />
      </div>
      <p className="text-lg font-semibold text-foreground">Import complete!</p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <StatCard label="Processed" value={result.totalProcessed} />
        <StatCard label="Inserted" value={result.prospectsInserted} color="text-green-500" />
        <StatCard label="Updated" value={result.prospectsUpdated} color="text-blue-500" />
        <StatCard label="Duplicates" value={result.duplicatesInBatch} color="text-amber-500" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center">
      <p className={cn('text-2xl font-bold', color ?? 'text-foreground')}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
