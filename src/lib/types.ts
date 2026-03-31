export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  lifecycleStage: string;
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
  field: string;
  operator: string;
  value: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
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
