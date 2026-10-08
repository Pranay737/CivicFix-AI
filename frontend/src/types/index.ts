export type Role = 'CITIZEN' | 'OFFICER' | 'DEPARTMENT_ADMIN' | 'SYSTEM_ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'REGISTERED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REJECTED'
  | 'DUPLICATE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  departmentId?: number;
  departmentName?: string;
  department?: Department;
  active: boolean;
  createdAt?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  departmentName?: string;
  department?: Department;
  defaultPriority: Priority;
  active: boolean;
  createdAt?: string;
}

export interface ComplaintImage {
  id: number;
  imageUrl: string;
  publicId?: string;
  caption?: string;
  createdAt: string;
}

export interface ComplaintStatusHistory {
  id: number;
  status: ComplaintStatus;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  changedById?: number;
  changedByName?: string;
  performedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  };
  comment?: string;
  createdAt: string;
}

export interface Resolution {
  id: number;
  officerId?: number;
  officerName?: string;
  notes: string;
  evidenceImagesJson?: string;
  evidenceImages?: Array<{ id?: number; imageUrl: string }>;
  resolvedAt: string;
}

export interface Feedback {
  id: number;
  citizenId?: number;
  citizenName?: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

export interface Complaint {
  id: number;
  trackingNumber: string;
  title: string;
  description: string;
  citizenId?: number;
  citizenName?: string;
  citizenEmail?: string;
  citizen?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  categoryId?: number;
  categoryName?: string;
  category?: Category;
  departmentId?: number;
  departmentName?: string;
  department?: Department;
  status: ComplaintStatus;
  priority: Priority;
  latitude?: number;
  longitude?: number;
  address?: string;

  // AI Analysis
  aiCategorySuggestion?: string;
  aiDepartmentSuggestion?: string;
  aiPrioritySuggestion?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  aiSummary?: string;

  // Duplicate Detection
  isDuplicate: boolean;
  duplicateOfId?: number;
  duplicateOfTrackingNumber?: string;
  similarityScore?: number;

  // SLA & Dates
  slaDueAt?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;

  images: ComplaintImage[];
  assignedOfficer?: User;
  timeline: ComplaintStatusHistory[];
  resolution?: Resolution;
  feedback?: Feedback;
}

export interface AiTriageResult {
  category: string;
  priority: Priority;
  department: string;
  summary: string;
  confidence: number;
  reasoning: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  source?: string;
  category?: string;
  content: string;
  chunkCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: number;
  sessionUuid: string;
  userId?: number;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  citations?: string[];
  createdAt: string;
}

export interface ChatResponse {
  sessionUuid: string;
  response?: string;
  message?: string;
  citations?: string[];
  relatedComplaint?: Complaint;
}

export interface OfficerWorkload {
  officerId: number;
  officerName: string;
  officerEmail?: string;
  assignedCount?: number;
  completedAssignments?: number;
  pendingCount?: number;
  resolvedCount?: number;
  activeAssignments?: number;
}

export interface DepartmentAnalytics {
  departmentId: number;
  departmentName: string;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  slaComplianceRate: number;
  averageResolutionHours: number;
  averageRating?: number;
  totalRatings: number;
  statusDistribution: Record<ComplaintStatus, number>;
  priorityDistribution: Record<Priority, number>;
  officerWorkload: OfficerWorkload[];
}

export interface SystemAnalytics {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  totalOverdue: number;
  overallSlaComplianceRate: number;
  overallAverageRating?: number;
  totalCitizens: number;
  totalOfficers: number;
  totalDepartments: number;
  departmentMetrics: {
    departmentId: number;
    departmentName: string;
    complaintCount: number;
    slaCompliance: number;
    avgRating?: number;
  }[];
  categoryMetrics: {
    categoryId: number;
    categoryName: string;
    departmentName: string;
    complaintCount: number;
  }[];
  recentAuditLogs: AuditLog[];
}

export interface AuditLog {
  id: number;
  userId?: number;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SlaPolicy {
  id: number;
  categoryId?: number;
  categoryName?: string;
  category?: Category;
  priority: Priority;
  resolutionHours: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
