export type LifecycleStage = "lead" | "prospect" | "customer" | "churned";
export type CampaignType = "email" | "sms";
export type CampaignStatus = "draft" | "active" | "completed";
export type FilterField = "lifecycleStage" | "tags" | "company" | "name" | "email";
export type FilterOperator = "equals" | "contains" | "not_equals";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  lifecycleStage: LifecycleStage;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  filters: SegmentFilter[];
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentFilter {
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject: string | null;
  body: string | null;
  segmentId: string | null;
  segment?: Segment;
  sentAt: string | null;
  opens: number;
  clicks: number;
  sent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
