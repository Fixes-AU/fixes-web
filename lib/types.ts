// ─── Base API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}


export type UserRole = 'client' | 'tradie' | 'admin'

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl: string | null
  avatarPublicId: string | null
  isEmailVerified: boolean
  isActive: boolean
  isCleaningAdmin?: boolean
  isFullAdmin?: boolean
  stripeCustomerId: string | null
  fixId: string
  createdAt: string
  updatedAt: string
}


export type TradieCategory =
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'plastering'
  | 'painting'
  | 'flooring'
  | 'carpentry'
  | 'emergency_make_safe'
  | 'general_labourer'
  | 'cleaning'
  | 'waste_removal'

export type DocumentType =
  | 'insurance'
  | 'white_card'
  | 'a_grade_license'
  | 'rec_license'
  | 'plumbing_registration'
  | 'plumbing_license'
  | 'mechanical_license'
  | 'electrical_license_hvac'
  | 'arctick_license'
  | 'carpentry_certificate'
  | 'builders_license_cbu'
  | 'police_check'

export interface TradieDocument {
  type: DocumentType
  label: string
  url: string | null
  publicId: string | null
  isVerified: boolean
  uploadedAt: string | null
  verifiedAt: string | null
  verifiedBy: string | null
}

export interface TradieProfile {
  _id: string
  userId: string | User
  skills: string[]
  categories: TradieCategory[]
  bio: string
  rating: {
    average: number
    count: number
  }
  jobSuccessRate: number
  isOnline: boolean
  currentLocation: {
    lat: number | null
    lng: number | null
    updatedAt: string | null
  }
  location: {
    type: 'Point'
    coordinates: [number, number] 
  }
  serviceRadiusKm: number
  stripeAccountId: string | null
  abn: string | null
  documents: TradieDocument[]
  isFullyVerified: boolean
  createdAt: string
  updatedAt: string
}


export type JobCategory = TradieCategory | 'other'

export type JobStatus =
  | 'analyzing'
  | 'quoted'
  | 'payment_pending'
  | 'scheduled'
  | 'dispatching'
  | 'no_tradie_found'
  | 'accepted'
  | 'on_the_way'
  | 'in_progress'
  | 'in_scope_review'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type PreferredTime = 'now' | 'scheduled' | '1-2weeks' | 'no-rush'

export interface JobImage {
  url: string
  publicId: string
  uploadedAt: string
}

export interface JobLocation {
  address: string
  suburb: string
  postcode: string
  state: string
  coordinates: {
    lat: number
    lng: number
  }
  geoLocation: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface Job {
  _id: string
  jobCode: string
  clientId: string | User
  title: string
  description: string
  category: JobCategory
  images: JobImage[]
  completionPhotos: JobImage[]   
  location: JobLocation
  preferredTime: PreferredTime
  scheduledFor: string | null
  status: JobStatus
  selectedTier: SkillLevel | null  
  isAfterHours: boolean    
  isWeekend: boolean        
  quote: string | Quote | null
  assignedTradieId: string | User | null
  payment: string | null
  clientReview: string | Review | null
  tradieReview: string | Review | null
  disputeId?: string | null
  completedAt: string | null
  completionOtpExpiry: string | null
  activeScopeChangeId: string | ScopeChange | null
  scopeChangeHistory: (string | ScopeChange)[]
  rescheduleFor: string | null          
  rescheduleReason: string | null
  rescheduleRequestedAt: string | null
  rescheduleRequestedBy: string | null
  rescheduleApprovedAt: string | null
  rescheduleDeclinedAt: string | null
  diagnosticAnswers: Record<string, string>
  completionFeedback?: { submittedAt: string | null } | null
  isAgencyManaged?: boolean
  cleaningType?: CleaningType | null
  cleaningTasks?: {
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed'
    photos?: { url: string; publicId: string; uploadedAt: string }[]
    completedAt?: string | null
    order: number
    subtasks?: { title: string; status?: string }[]
  }[]
  cleaningPricing?: {
    ratePerHour: number | null
    estimatedHours: number | null
    totalEstimate: number | null
    actualHours: number | null
    finalAmount: number | null
  }
  recurringSchedule?: string | null
  recurringInstanceIndex?: number | null
  createdAt: string
  updatedAt: string
}


export type ScopeChangeStatus = 'pending_client' | 'accepted' | 'declined' | 'proof_submitted'

export interface ScopeChange {
  _id: string
  jobId: string | Job
  requestedBy: string | User
  status: ScopeChangeStatus
  description: string
  photos: JobImage[]
  originalPrice: number
  newPrice: number
  priceDifference: number
  gstAmount?: number
  totalIncGst?: number
  newQuoteOptions: QuoteOption[]
  selectedNewTier: SkillLevel | null
  proofPhotos: JobImage[]
  proofDescription: string | null
  createdAt: string
  updatedAt: string
}




export type SkillLevel = 'junior' | 'senior' | 'specialist' | 'premium'
export type QuoteEngine = 'gemini' | 'gemini-custom-ml' | 'rule_based' | 'placeholder'

export interface QuoteOption {
  tier: SkillLevel
  estimatedHours: {
    min: number
    max: number
  }
  price: {
    min: number
    max: number
    currency: string
  }
  suggestedFixedPrice: number
  gstAmount?: number
  totalIncGst?: number
  confidence: number
  reasoning: string
}

export interface Quote {
  _id: string
  jobId: string
  detectedCategory: string
  options: QuoteOption[]          
  morningOptions: QuoteOption[]  
  weekdayOptions: QuoteOption[] 
  selectedTier: SkillLevel | null 
  engine: QuoteEngine
  isLargeProject: boolean        
  clientAccepted: boolean | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CancelJobResponse {
  job: Job
  cancellationFeeAmount: number   
  tradiePayout: number      
  platformRevenue: number   
  refundAmount: number    
  currency: 'AUD'
}

export interface CompletionFeedback {
  actualHours: number | null
  actualMaterialCost: number | null
  quoteAccuracy: 'too_low' | 'about_right' | 'too_high' | null
  notes: string | null
  submittedAt: string | null
}

export interface DiagnosticQuestion {
  id: string
  text: string
  options: string[]
}

export interface PreflightQuestionsResponse {
  questions: DiagnosticQuestion[]
}


export interface ScopeChangePreviewResponse {
  originalPrice: number
  estimatedNewPrice: number
  priceDifference: number              
  direction: 'increase' | 'decrease' | 'unchanged'
  reasoning: string
  confidence: number                   
}


export type AiEngine = 'gemini' | 'gemini-custom-ml' | 'rule_based' | 'placeholder'

export interface TierPriceSnapshot {
  tier: SkillLevel
  price: number  
}

export interface AiAnalysisLog {
  _id: string
  jobId: string
  inputTitle: string
  inputCategory: string
  inputLocation: { suburb: string; state: string }
  imageCount: number
  isAfterHours?: boolean
  isScopeChange: boolean
  success: boolean
  engine: AiEngine
  outputCategory: string | null
  outputPriceMin: number | null
  outputPriceMax: number | null
  outputFixedPrice: number | null
  outputConfidence: number | null
  outputReasoning: string | null
  modelVersion: string | null
  latencyMs: number | null
  finishReason: string | null
  tokensIn: number | null
  tokensOut: number | null
  tokensTotal: number | null
  rawOutputPreview: string | null
  thinkingSteps: string[]
  allTierPrices: TierPriceSnapshot[]
  diagnosticAnswersUsed: boolean
  partsDetected: string[]             
  errorMessage: string | null
  safetyRatings: Array<{ category: string; probability: string }>
  completionFeedback?: CompletionFeedback | null
  createdAt: string
  updatedAt: string
}


export type MessageType = 'text' | 'image' | 'system'

export interface Message {
  _id: string
  jobId: string
  senderId: string | User
  receiverId: string | null
  content: string
  type: MessageType
  imageUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}


export type ReviewDirection = 'client_to_tradie' | 'tradie_to_client'

export interface Review {
  _id: string
  jobId: string
  reviewerId: string | User
  revieweeId: string | User
  direction: ReviewDirection
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  average: number
  total: number
  breakdown: Record<number, number>
}


export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterClientResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterTradieResponse {
  accessToken: string
  refreshToken: string
  user: User
  profile: TradieProfile
  requiredDocuments: Array<{ type: DocumentType; label: string }>
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface MeResponse {
  user: User
  profile: TradieProfile | null
}


export interface AdminStats {
  users: { total: number; clients: number; tradies: number }
  jobs: { total: number; completed: number; cancelled: number; active: number }
  tradies: { pendingVerification: number; fullyVerified: number }
  revenue: {
    totalRevenue: number
    platformFee: number
    tradieEarnings: number
    completedPayments: number
  }
}

export interface AdminUserDetail {
  user: User
  profile: TradieProfile | null
  recentJobs: Job[]
}

export interface PendingTradieItem {
  userId: User
  categories: TradieCategory[]
  isFullyVerified: boolean
  rating: { average: number; count: number }
  docSummary: {
    total: number
    uploaded: number
    verified: number
    pending: number
  }
}

export interface TradieDocumentsResponse {
  tradie: User
  categories: TradieCategory[]
  isFullyVerified: boolean
  abn: string | null
  documents: TradieDocument[]
}


export interface SignedUploadResponse {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  publicId: string
}


export interface DispatchNewPayload {
  jobId: string
  jobCode: string
  title: string
  category: string
  price: { min: number; max: number }
  distance: number
  expiresAt: string
  cancellationFee?: number
  refundAmount?: number
  currency?: string
}

export interface JobStatusUpdatePayload {
  jobId: string
  status: JobStatus
  tradieId?: string
  tradieName?: string
}

export interface MessageNewPayload {
  _id: string
  jobId: string
  senderId: string
  content: string
  type: MessageType
  createdAt: string
}

export interface TradieLocationUpdatePayload {
  lat: number
  lng: number
  updatedAt: number
}


export type CleaningType =
  | 'standard_clean'
  | 'deep_clean'
  | 'end_of_lease'
  | 'move_in_clean'
  | 'commercial_clean'
  | 'carpet_clean'
  | 'window_clean'
  | 'spring_clean'
  | 'post_renovation'
  | 'general_waste'
  | 'green_waste'

export interface CleaningSubtask {
  title: string
  description?: string
  estimatedMinutes?: number
  isDefault: boolean
}

export interface CleaningTask {
  title: string
  description?: string
  estimatedMinutes: number
  isDefault: boolean
  order: number
  subtasks: CleaningSubtask[]
}

export interface CleaningTaskTemplate {
  _id: string
  cleaningType: CleaningType
  label: string
  category: 'cleaning' | 'waste_removal'
  tasks: CleaningTask[]
}

export interface SelectedCleaningTask {
  title: string
  subtasks: string[]
  estimatedMinutes: number
}

export interface CleaningQuote {
  ratePerHour: number
  baseRate?: number
  estimatedHours: number
  totalEstimate: number
  cleaningType?: string
  minHours?: number
  taskMinutes?: number
  adjustedMinutes?: number
  belowMinimum?: boolean
  propertyMultiplier?: number
  confidence?: number
  reasoning?: string
}

export interface CleaningSummary {
  summary: string
  taskCount: number
  estimatedHours: number
}

export type RecurringFrequency = 'weekly' | 'fortnightly'

export interface RecurringScheduleInput {
  cleaningType: CleaningType
  frequency: RecurringFrequency
  dayOfWeek: number
  preferredTime: string
  totalInstances: number
  assignPreference: 'same_cleaner' | 'any_cleaner'
}

export type PropertyType =
  | 'studio' | '1bed_apartment' | '2bed_apartment'
  | 'single_storey' | 'townhouse' | 'double_storey' | 'commercial'

export interface PropertyDetails {
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  studio: 'Studio Apartment',
  '1bed_apartment': '1-Bed Apartment',
  '2bed_apartment': '2-Bed Apartment',
  single_storey: 'Single-Storey House',
  townhouse: 'Townhouse',
  double_storey: 'Double-Storey House',
  commercial: 'Commercial / Office',
}

export const PROPERTY_TYPE_MULTIPLIERS: Record<PropertyType, number> = {
  studio: 0.50,
  '1bed_apartment': 0.65,
  '2bed_apartment': 0.80,
  single_storey: 1.00,
  townhouse: 1.15,
  double_storey: 1.25,
  commercial: 1.10,
}
