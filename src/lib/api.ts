import type {
  Campaign,
  CampaignStats,
  Sequence,
  Followup,
  Prospect,
  List,
  Sender,
  Message,
  Tag,
  PagedResponse,
  CreateCampaignInput,
  CreateProspectInput,
  CreateFollowupInput,
  CreateSenderInput,
  CreateListInput,
  CreateTagInput,
} from '@/types';

const API_BASE = '/api';

class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const error = await res.json();
      message = error.message || error.title || message;
    } catch {
      // ignore parse error
    }
    throw new ApiRequestError(message, res.status);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const cleaned = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ''
  );
  if (cleaned.length === 0) return '';
  return '?' + new URLSearchParams(cleaned.map(([k, v]) => [k, String(v)])).toString();
}

export const api = {
  // Campaigns
  campaigns: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Campaign>>(`/campaigns${qs(params)}`),
    get: (id: number) => request<Campaign>(`/campaigns/${id}`),
    create: (data: CreateCampaignInput) =>
      request<Campaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Campaign>) =>
      request<Campaign>(`/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/campaigns/${id}`, { method: 'DELETE' }),
    start: (id: number) =>
      request<void>(`/campaigns/${id}/start`, { method: 'POST' }),
    pause: (id: number) =>
      request<void>(`/campaigns/${id}/pause`, { method: 'POST' }),
    copy: (id: number, newName?: string) =>
      request<Campaign>(
        `/campaigns/${id}/copy${qs({ newCampaignName: newName })}`,
        { method: 'POST' }
      ),
    stats: (id: number, params?: Record<string, string | number | undefined>) =>
      request<CampaignStats>(`/campaigns/${id}/stats${qs(params)}`),
  },

  // Sequences
  sequences: {
    list: (campaignId: number) =>
      request<Sequence[]>(`/campaigns/${campaignId}/sequences`),
    create: (campaignId: number, data: { name: string }) =>
      request<Sequence>(`/campaigns/${campaignId}/sequences`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (campaignId: number, sequenceId: number) =>
      request<void>(`/campaigns/${campaignId}/sequences/${sequenceId}`, {
        method: 'DELETE',
      }),
  },

  // Followups
  followups: {
    list: (sequenceId: number) =>
      request<Followup[]>(`/sequences/${sequenceId}/followups`),
    get: (sequenceId: number, followupId: number) =>
      request<Followup>(`/sequences/${sequenceId}/followups/${followupId}`),
    create: (sequenceId: number, data: CreateFollowupInput) =>
      request<Followup>(`/sequences/${sequenceId}/followups`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (sequenceId: number, followupId: number, data: Partial<Followup>) =>
      request<Followup>(`/sequences/${sequenceId}/followups/${followupId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (sequenceId: number, followupId: number) =>
      request<void>(`/sequences/${sequenceId}/followups/${followupId}`, {
        method: 'DELETE',
      }),
  },

  // Prospects
  prospects: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Prospect>>(`/prospects${qs(params)}`),
    get: (id: number) => request<Prospect>(`/prospects/${id}`),
    create: (data: CreateProspectInput) =>
      request<Prospect>('/prospects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Prospect>) =>
      request<Prospect>(`/prospects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/prospects/${id}`, { method: 'DELETE' }),
  },

  // Lists
  lists: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<List>>(`/lists${qs(params)}`),
    get: (id: number) => request<List>(`/lists/${id}`),
    create: (data: CreateListInput) =>
      request<List>('/lists', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<List>) =>
      request<List>(`/lists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/lists/${id}`, { method: 'DELETE' }),
    prospects: (id: number, params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Prospect>>(`/lists/${id}/prospects${qs(params)}`),
  },

  // Senders
  senders: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Sender>>(`/senders${qs(params)}`),
    get: (id: number) => request<Sender>(`/senders/${id}`),
    create: (data: CreateSenderInput) =>
      request<Sender>('/senders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Sender>) =>
      request<Sender>(`/senders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/senders/${id}`, { method: 'DELETE' }),
  },

  // Messages
  messages: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Message>>(`/messages${qs(params)}`),
    get: (id: number) => request<Message>(`/messages/${id}`),
  },

  // Tags
  tags: {
    list: (params?: Record<string, string | number | undefined>) =>
      request<PagedResponse<Tag>>(`/tags${qs(params)}`),
    get: (id: number) => request<Tag>(`/tags/${id}`),
    create: (data: CreateTagInput) =>
      request<Tag>('/tags', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Tag>) =>
      request<Tag>(`/tags/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/tags/${id}`, { method: 'DELETE' }),
  },
};
