export type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed';
export type ProspectStatus =
  | 'NotSet'
  | 'Neutral'
  | 'Interested'
  | 'NotInterested'
  | 'MaybeLater'
  | 'MeetingBooked'
  | 'MeetingCompleted'
  | 'Won'
  | 'BounceHard'
  | 'BounceSoft'
  | 'Unsub'
  | 'Blacklisted'
  | 'Stopped'
  | 'AutoReply'
  | 'AutoOoo';
export type MessageType = 'Sent' | 'Reply' | 'SentManual';

export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  senderIds?: number[];
  listIds?: number[];
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  sendingStartTime?: string;
  sendingEndTime?: string;
  sendingDays?: string[];
  timezone?: string;
}

export interface CampaignStats {
  campaignId: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
}

export interface Sequence {
  id: number;
  campaignId: number;
  name: string;
  createdAt: string;
  followups?: Followup[];
}

export interface Followup {
  id: number;
  sequenceId: number;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
  isActive: boolean;
  stepNumber: number;
}

export interface Prospect {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  status: ProspectStatus;
  tags?: Tag[];
  customFields?: Record<string, string>;
  createdAt: string;
}

export interface List {
  id: number;
  title: string;
  prospectsCount: number;
  createdAt: string;
  description?: string;
}

export interface Sender {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  warmupEnabled: boolean;
  warmupStatus?: string;
  dailyLimit: number;
  currentDailyCount: number;
  status?: string;
  folder?: string;
  errorCount: number;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  imapHost?: string;
  imapPort?: number;
}

export interface Message {
  id: number;
  type: MessageType;
  subject: string;
  fromEmail: string;
  toEmail: string;
  body?: string;
  sentAt?: string;
  opens: number;
  clicks: number;
  campaignId?: number;
  followupId?: number;
  prospectId?: number;
}

export interface Tag {
  id: number;
  title: string;
  description?: string;
  prospectCount: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  fromName?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface CreateProspectInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  listId?: number;
  tagIds?: number[];
}

export interface CreateFollowupInput {
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
}

export interface CreateSenderInput {
  email: string;
  firstName?: string;
  lastName?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  imapHost?: string;
  imapPort?: number;
  imapUsername?: string;
  imapPassword?: string;
  dailyLimit: number;
  warmupEnabled: boolean;
}

export interface CreateListInput {
  title: string;
  description?: string;
}

export interface CreateTagInput {
  title: string;
  description?: string;
}

export interface ProspectImport {
  totalProcessed: number;
  prospectsInserted: number;
  prospectsUpdated: number;
  duplicatesInBatch: number;
  subscriptionsAdded: number;
  campaignAdded: number;
}
