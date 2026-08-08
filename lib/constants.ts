import type { TradieCategory, JobCategory, JobStatus, DocumentType } from './types'

// ─── API Base URL ───────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'


export const VALID_CATEGORIES: TradieCategory[] = [
  'electrical',
  'plumbing',
  'hvac',
  'plastering',
  'painting',
  'flooring',
  'carpentry',
  'roofing',
  'emergency_make_safe',
  'general_labourer',
  'handyman',
  'gardening_landscaping',
  'auto_care',
  'cleaning',
  'waste_removal',
]

export const AGENCY_CATEGORIES: TradieCategory[] = ['cleaning', 'waste_removal']

export const CATEGORY_LABELS: Record<JobCategory, string> = {
  electrical: 'Electrician',
  plumbing: 'Plumber',
  hvac: 'HVAC / Refrigeration',
  plastering: 'Plasterer',
  painting: 'Painter',
  flooring: 'Flooring',
  carpentry: 'Carpenter',
  roofing: 'Roofing',
  emergency_make_safe: 'Emergency Make Safe',
  general_labourer: 'General Labourer',
  handyman: 'Handyman',
  gardening_landscaping: 'Gardening & Landscaping',
  auto_care: 'Auto Care',
  cleaning: 'Cleaning',
  waste_removal: 'Waste Removal',
  other: 'Other',
}

export const TRADIE_CATEGORY_LABELS: Record<JobCategory, string> = {
  ...CATEGORY_LABELS,
  roofing: 'Roofer',
}


export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  analyzing: 'Analyzing',
  quoted: 'Quote Ready',
  payment_pending: 'Awaiting Payment',
    scheduled: 'Scheduled',

  dispatching: 'Finding Tradie',
  no_tradie_found: 'No Tradie Found',
  accepted: 'Tradie Assigned',
  on_the_way: 'On The Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
    rescheduled: 'Reschedule Requested',

  in_scope_review: 'In Scope Review',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  analyzing: 'bg-blue-100 text-blue-700',
  quoted: 'bg-amber-100 text-amber-700',
  payment_pending: 'bg-purple-100 text-purple-700',
    scheduled: 'bg-blue-100 text-blue-700',

  dispatching: 'bg-indigo-100 text-indigo-700',
  no_tradie_found: 'bg-red-100 text-red-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  on_the_way: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-700',
    rescheduled: 'bg-blue-100 text-blue-700',

  in_scope_review: 'bg-orange-100 text-orange-700',
}


export const TIER_LABELS: Record<string, string> = {
  junior: 'Standard',
  senior: 'Premium',
  specialist: 'Expert',
  premium: 'Premium Service',
}


export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  insurance: 'Public Liability Insurance',
  white_card: 'White Card',
  a_grade_license: 'A-Grade Electrical License',
  rec_license: 'Electrical Contractor License (REC)',
  plumbing_registration: 'Plumbing Registration',
  plumbing_license: 'Plumbing License',
  mechanical_license: 'Plumbing License – Mechanical',
  electrical_license_hvac: 'Electrical License – HVAC',
  arctick_license: 'ARCtick License',
  carpentry_certificate: 'Carpentry Certificate',
  builders_license_cbu: 'Builders License (CBU)',
  police_check: 'Police Check',
  roofing_trade_qualification: 'Roofing Trade Qualification',
  roof_tiling_license: 'Roof Tiling Licence / Registration',
  roof_plumbing_license: 'Roof Plumbing Licence / Registration',
  roof_wall_cladding_license: 'Roof and Wall Cladding Licence',
  building_contractor_license: 'Building Contractor Licence / Registration',
  painting_registration: 'Painting Contractor Registration',
  working_at_heights: 'Working Safely at Heights',
  high_risk_work_license: 'High Risk Work Licence',
}

export const ROOFING_CAPABILITIES = [
  { value: 'inspection_leak_repair', label: 'Roof inspection & leak repair' },
  { value: 'roof_tiling', label: 'Tile roofing' },
  { value: 'metal_roofing', label: 'Metal / Colorbond roofing' },
  { value: 'roof_plumbing_drainage', label: 'Gutters, downpipes & roof drainage' },
  { value: 'skylights', label: 'Skylights' },
  { value: 'restoration_painting', label: 'Roof restoration, coating & painting' },
  { value: 'cleaning_maintenance', label: 'Roof cleaning & maintenance' },
  { value: 'storm_damage_repair', label: 'Storm damage repair' },
  { value: 'full_replacement', label: 'Full roof replacement / installation' },
] as const

export const CLEANING_TYPE_LABELS: Record<string, string> = {
  standard_clean: 'Standard Clean',
  deep_clean: 'Deep Clean',
  end_of_lease: 'End of Lease Clean',
  move_in_clean: 'Move-in Clean',
  commercial_clean: 'Commercial Clean',
  carpet_clean: 'Carpet Clean',
  window_clean: 'Window Clean',
  spring_clean: 'Spring Clean',
  post_renovation: 'Post-Renovation Clean',
  general_waste: 'General Waste Removal',
  green_waste: 'Green Waste Removal',
}


export const PREFERRED_TIME_LABELS: Record<string, string> = {
  now: 'Now',
  scheduled: 'Scheduled',
  '1-2weeks': 'In 1–2 Weeks',
  'no-rush': 'No Rush',
}


export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
] as const
