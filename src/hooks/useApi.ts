import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateCampaignInput, CreateProspectInput, CreateListInput, CreateTagInput, CreateSenderInput, CreateFollowupInput } from '@/types';
import type { MappedProspect } from '@/lib/spreadsheet';

export function useCampaigns(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => api.campaigns.list(params),
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => api.campaigns.get(id),
    enabled: id > 0,
  });
}

export function useCampaignStats(id: number) {
  return useQuery({
    queryKey: ['campaigns', id, 'stats'],
    queryFn: () => api.campaigns.stats(id),
    enabled: id > 0,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignInput) => api.campaigns.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useUpdateCampaign(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.campaigns.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaigns', id] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.campaigns.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useStartCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.campaigns.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function usePauseCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.campaigns.pause(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useCopyCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name?: string }) => api.campaigns.copy(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useSequences(campaignId: number) {
  return useQuery({
    queryKey: ['sequences', campaignId],
    queryFn: () => api.sequences.list(campaignId),
    enabled: campaignId > 0,
  });
}

export function useCreateSequence(campaignId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.sequences.create(campaignId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sequences', campaignId] }),
  });
}

export function useFollowups(sequenceId: number) {
  return useQuery({
    queryKey: ['followups', sequenceId],
    queryFn: () => api.followups.list(sequenceId),
    enabled: sequenceId > 0,
  });
}

export function useCreateFollowup(sequenceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFollowupInput) => api.followups.create(sequenceId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups', sequenceId] }),
  });
}

export function useUpdateFollowup(sequenceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ followupId, data }: { followupId: number; data: Record<string, unknown> }) =>
      api.followups.update(sequenceId, followupId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups', sequenceId] }),
  });
}

export function useDeleteFollowup(sequenceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followupId: number) => api.followups.delete(sequenceId, followupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups', sequenceId] }),
  });
}

export function useProspects(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['prospects', params],
    queryFn: () => api.prospects.list(params),
  });
}

export function useProspect(id: number) {
  return useQuery({
    queryKey: ['prospects', id],
    queryFn: () => api.prospects.get(id),
    enabled: id > 0,
  });
}

export function useCreateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProspectInput) => api.prospects.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  });
}

export function useDeleteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.prospects.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  });
}

export function useBulkImportProspects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      prospects,
      listId,
      campaignId,
      addOnlyIfNew,
      notInOtherCampaign,
    }: {
      prospects: MappedProspect[];
      listId: number;
      campaignId?: number;
      addOnlyIfNew?: boolean;
      notInOtherCampaign?: boolean;
    }) =>
      api.prospects.bulkCreate(prospects, {
        listId,
        campaignId,
        addOnlyIfNew,
        notInOtherCampaign,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  });
}

export function useLists(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['lists', params],
    queryFn: () => api.lists.list(params),
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListInput) => api.lists.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.lists.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useSenders(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['senders', params],
    queryFn: () => api.senders.list(params),
  });
}

export function useCreateSender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSenderInput) => api.senders.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['senders'] }),
  });
}

export function useDeleteSender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.senders.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['senders'] }),
  });
}

export function useMessages(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => api.messages.list(params),
  });
}

export function useTags(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => api.tags.list(params),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagInput) => api.tags.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.tags.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}
