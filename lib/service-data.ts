// lib/service-data.ts

import type { JobCategory } from './types'

export interface PopularTask {
  label: string
  preFilledTitle: string
}

export interface ServiceMeta {
  slug: string
  category: JobCategory
  label: string
  tagline: string
  description: string
  accent: string
  popularTasks: PopularTask[]
  howItWorks: { title: string; desc: string }[]
}

export const SERVICE_DATA: ServiceMeta[] = [
  {
    slug: 'electrician',
    category: 'electrical',
    label: 'Electrician',
    tagline: 'Licensed sparkies for any electrical work',
    description:
      'From replacing light switches and installing power points to full switchboard upgrades — our verified, licensed electricians handle it all. Every sparky on Fixes is background-checked, insured, and rated by real customers.',
    accent: '#F59E0B',
    popularTasks: [
      { label: 'Replace light switch', preFilledTitle: 'Replace a light switch' },
      { label: 'Install power point', preFilledTitle: 'Install a new power point' },
      { label: 'Ceiling fan install', preFilledTitle: 'Install a ceiling fan' },
      { label: 'Fix power outage', preFilledTitle: 'Fix power outage in my home' },
      { label: 'LED downlights', preFilledTitle: 'Install LED downlights' },
      { label: 'Switchboard upgrade', preFilledTitle: 'Upgrade switchboard' },
      { label: 'RCD safety switch', preFilledTitle: 'Install RCD safety switch' },
    ],
    howItWorks: [
      { title: 'Describe your electrical job', desc: 'Tell us what needs fixing — add photos and your address so we can match you with the right sparky.' },
      { title: 'Get an AI-powered quote', desc: 'Our AI analyses your job and delivers a fair, transparent quote in seconds — no hidden fees.' },
      { title: 'Licensed electrician dispatched', desc: 'A verified, insured electrician is sent to your door at the time you choose.' },
    ],
  },
  {
    slug: 'plumber',
    category: 'plumbing',
    label: 'Plumber',
    tagline: 'Fix leaks, unblock drains & more',
    description:
      'Leaking taps, blocked drains, burst pipes, hot water repairs — our licensed plumbers are ready to handle any plumbing emergency or scheduled maintenance. Transparent pricing, no call-out surprises.',
    accent: '#3B82F6',
    popularTasks: [
      { label: 'Fix leaking tap', preFilledTitle: 'Fix a leaking tap' },
      { label: 'Unblock drain', preFilledTitle: 'Unblock a blocked drain' },
      { label: 'Replace toilet', preFilledTitle: 'Replace toilet cistern internals' },
      { label: 'Hot water system', preFilledTitle: 'Repair hot water system' },
      { label: 'Burst pipe', preFilledTitle: 'Fix a burst pipe' },
      { label: 'Replace tap', preFilledTitle: 'Replace kitchen tap' },
    ],
    howItWorks: [
      { title: 'Describe the plumbing issue', desc: 'Tell us what\'s wrong — leaking tap, blocked drain, or something else. Photos help our AI give a better quote.' },
      { title: 'Instant fair quote', desc: 'Get a transparent, AI-generated price based on your specific job — no surprises, no hidden call-out fees.' },
      { title: 'Licensed plumber arrives', desc: 'A verified, insured plumber is dispatched to your door when you need them.' },
    ],
  },
  {
    slug: 'hvac',
    category: 'hvac',
    label: 'HVAC & Refrigeration',
    tagline: 'Heating, cooling & ventilation experts',
    description:
      'Split system installs, ducted system repairs, air conditioning re-gas and filter replacement — our HVAC technicians keep your home comfortable year-round.',
    accent: '#06B6D4',
    popularTasks: [
      { label: 'Split system install', preFilledTitle: 'Install a split system air conditioner' },
      { label: 'AC not cooling', preFilledTitle: 'Air conditioner not cooling properly' },
      { label: 'Filter clean/replace', preFilledTitle: 'Clean or replace AC filter' },
      { label: 'Re-gas aircon', preFilledTitle: 'Re-gas split system' },
      { label: 'Ducted system repair', preFilledTitle: 'Repair ducted air conditioning' },
    ],
    howItWorks: [
      { title: 'Describe your HVAC issue', desc: 'Tell us about your heating or cooling problem, the brand/model if you know it, and upload photos.' },
      { title: 'AI-powered quote', desc: 'Get an instant, fair price tailored to your specific system and issue — no hidden charges.' },
      { title: 'Technician dispatched', desc: 'A licensed, ARCtick-certified technician arrives at your chosen time.' },
    ],
  },
  {
    slug: 'plasterer',
    category: 'plastering',
    label: 'Plasterer',
    tagline: 'Patch, repair & smooth wall finishes',
    description:
      'Hole patches, ceiling cracks, cornice repairs, and full room re-plastering. Our skilled plasterers deliver flawless finishes every time.',
    accent: '#A78BFA',
    popularTasks: [
      { label: 'Patch hole in wall', preFilledTitle: 'Patch a hole in the wall' },
      { label: 'Fix ceiling crack', preFilledTitle: 'Fix crack in ceiling' },
      { label: 'Cornice repair', preFilledTitle: 'Repair damaged cornice' },
      { label: 'Full room re-plaster', preFilledTitle: 'Re-plaster full room' },
      { label: 'Water damage repair', preFilledTitle: 'Repair water damaged plaster' },
    ],
    howItWorks: [
      { title: 'Describe the plastering work', desc: 'Tell us about the damage — holes, cracks, water damage. Upload photos for a more accurate quote.' },
      { title: 'Instant smart quote', desc: 'Our AI analyses the scope and provides a fair, transparent estimate in seconds.' },
      { title: 'Plasterer arrives', desc: 'A verified, experienced plasterer is dispatched to deliver a smooth, professional finish.' },
    ],
  },
  {
    slug: 'painter',
    category: 'painting',
    label: 'Painter',
    tagline: 'Interior, exterior & feature walls',
    description:
      'Room repaints, exterior touch-ups, feature walls, fence staining — our painters bring colour and life to your home with precision and care.',
    accent: '#EC4899',
    popularTasks: [
      { label: 'Paint a room', preFilledTitle: 'Paint a single room' },
      { label: 'Exterior repaint', preFilledTitle: 'Repaint house exterior' },
      { label: 'Feature wall', preFilledTitle: 'Paint a feature wall' },
      { label: 'Fence painting', preFilledTitle: 'Paint fence' },
      { label: 'Touch-up paint', preFilledTitle: 'Touch up paint on walls' },
    ],
    howItWorks: [
      { title: 'Describe the painting job', desc: 'Tell us the area, surface type, and any colour preferences. Photos help our AI quote accurately.' },
      { title: 'Fair AI quote', desc: 'Get a transparent price based on room size, surface prep, and paint type — no guesswork.' },
      { title: 'Painter dispatched', desc: 'A skilled, insured painter arrives to transform your space.' },
    ],
  },
  {
    slug: 'flooring',
    category: 'flooring',
    label: 'Flooring',
    tagline: 'Timber, tiles, vinyl & carpet',
    description:
      'Vinyl plank, hardwood, tiles, carpet — whether you need new flooring installed or damaged boards replaced, our flooring specialists deliver beautiful results.',
    accent: '#14B8A6',
    popularTasks: [
      { label: 'Install vinyl plank', preFilledTitle: 'Install vinyl plank flooring' },
      { label: 'Replace floorboards', preFilledTitle: 'Replace damaged floorboards' },
      { label: 'Tile a bathroom', preFilledTitle: 'Tile bathroom floor' },
      { label: 'Sand & polish timber', preFilledTitle: 'Sand and polish timber floors' },
      { label: 'Lay carpet', preFilledTitle: 'Lay new carpet' },
    ],
    howItWorks: [
      { title: 'Describe your flooring needs', desc: 'Tell us the room, flooring type, and approximate area. Photos of the current floor help a lot.' },
      { title: 'Smart quote in seconds', desc: 'Our AI factors in material type, area size, and prep work to give you a fair price.' },
      { title: 'Flooring pro arrives', desc: 'A verified flooring specialist is dispatched to deliver a flawless result.' },
    ],
  },
  {
    slug: 'carpenter',
    category: 'carpentry',
    label: 'Carpenter',
    tagline: 'Decks, doors, fences & structural work',
    description:
      'From fixing sticking doors and building decks to fence repairs and custom shelving — our carpenters bring craftsmanship and reliability to every project.',
    accent: '#F97316',
    popularTasks: [
      { label: 'Fix sticking door', preFilledTitle: 'Fix a sticking door' },
      { label: 'Build a deck', preFilledTitle: 'Build a new deck' },
      { label: 'Replace fence', preFilledTitle: 'Replace fence palings' },
      { label: 'Install shelving', preFilledTitle: 'Install wall shelving' },
      { label: 'Door frame repair', preFilledTitle: 'Repair door frame' },
      { label: 'New door handle', preFilledTitle: 'Replace door handle' },
    ],
    howItWorks: [
      { title: 'Describe the carpentry job', desc: 'Tell us what needs building, fixing, or replacing — add photos and measurements if possible.' },
      { title: 'AI-powered pricing', desc: 'Get an instant, transparent quote based on materials, complexity, and your location.' },
      { title: 'Carpenter dispatched', desc: 'A skilled, insured carpenter arrives to get the job done right.' },
    ],
  },
  {
    slug: 'emergency',
    category: 'emergency_make_safe',
    label: 'Emergency Make Safe',
    tagline: '24/7 urgent safety response',
    description:
      'Exposed wiring, burst pipes, storm damage, gas leaks — when safety is at risk, our emergency tradies respond fast to make your property safe. Available 24/7.',
    accent: '#EF4444',
    popularTasks: [
      { label: 'Exposed wiring', preFilledTitle: 'Emergency — exposed dangerous wiring' },
      { label: 'Burst pipe flooding', preFilledTitle: 'Emergency — burst pipe flooding house' },
      { label: 'Storm damage', preFilledTitle: 'Emergency — storm damage to property' },
      { label: 'Gas leak', preFilledTitle: 'Emergency — suspected gas leak' },
    ],
    howItWorks: [
      { title: 'Report the emergency', desc: 'Tell us what\'s happening — our system prioritises your job for immediate dispatch.' },
      { title: 'Instant priority quote', desc: 'Get an emergency-rated quote in seconds. Safety-critical jobs are fast-tracked.' },
      { title: 'Emergency tradie dispatched', desc: 'A licensed, insured tradie is immediately dispatched to make your property safe.' },
    ],
  },
  {
    slug: 'labourer',
    category: 'general_labourer',
    label: 'General Labourer',
    tagline: 'Moving, demolition assist & site labour',
    description:
      'Get practical help with heavy lifting, moving, material handling, demolition assistance, and general site labour.',
    accent: '#64748B',
    popularTasks: [
      { label: 'Moving / lifting', preFilledTitle: 'Help with heavy lifting and moving' },
      { label: 'Demolition assist', preFilledTitle: 'Assist with demolition work' },
      { label: 'Site cleanup', preFilledTitle: 'General site cleanup assistance' },
      { label: 'Material handling', preFilledTitle: 'Help moving materials on site' },
    ],
    howItWorks: [
      { title: 'Describe the job', desc: 'Tell us what needs moving, lifting, clearing, or assisting. Photos help us scope it accurately.' },
      { title: 'Fair instant quote', desc: 'Our AI estimates the time and labour required to give you a transparent price.' },
      { title: 'Labourer dispatched', desc: 'A reliable, insured labourer arrives to get the hard work done.' },
    ],
  },
  {
    slug: 'handyman',
    category: 'handyman',
    label: 'Handyman',
    tagline: 'Minor repairs, assembly & odd jobs',
    description:
      'Get help with furniture assembly, TV mounting, minor non-licensed repairs, and odd jobs around your property. For regulated electrical, plumbing, HVAC, or building work, choose the relevant licensed trade category.',
    accent: '#8B5CF6',
    popularTasks: [
      { label: 'Minor repairs', preFilledTitle: 'Minor repairs around the property' },
      { label: 'Furniture assembly', preFilledTitle: 'Assemble furniture' },
      { label: 'TV wall mount', preFilledTitle: 'Mount TV on wall' },
      { label: 'Odd jobs', preFilledTitle: 'Miscellaneous odd jobs around the property' },
    ],
    howItWorks: [
      { title: 'Describe the task', desc: 'Tell us what needs fixing, assembling, or mounting and include photos where helpful.' },
      { title: 'Get a clear quote', desc: 'Receive transparent pricing based on the task, materials, and estimated time.' },
      { title: 'Handyman dispatched', desc: 'A vetted, insured handyman arrives at your chosen time.' },
    ],
  },
  {
    slug: 'gardening-landscaping',
    category: 'gardening_landscaping',
    label: 'Gardening & Landscaping',
    tagline: 'Garden care, planting & outdoor improvements',
    description:
      'Book help with lawn mowing, pruning, garden cleanup, planting, turf, and basic landscaping. Larger specialist projects can be assessed from your job details and photos.',
    accent: '#22C55E',
    popularTasks: [
      { label: 'Lawn mowing', preFilledTitle: 'Mow and edge the lawn' },
      { label: 'Pruning', preFilledTitle: 'Prune shrubs and garden plants' },
      { label: 'Garden cleanup', preFilledTitle: 'Garden cleanup and maintenance' },
      { label: 'Planting', preFilledTitle: 'Plant and prepare garden beds' },
      { label: 'Lay turf', preFilledTitle: 'Prepare and lay new turf' },
      { label: 'Basic landscaping', preFilledTitle: 'Basic landscaping improvements' },
    ],
    howItWorks: [
      { title: 'Describe your outdoor space', desc: 'Share the property size, required garden work, access details, and photos.' },
      { title: 'Get a tailored quote', desc: 'Receive transparent pricing based on labour, materials, and green-waste requirements.' },
      { title: 'Gardener dispatched', desc: 'A vetted, insured gardening professional arrives at your chosen time.' },
    ],
  },
  {
    slug: 'cleaning',
    category: 'cleaning',
    label: 'Cleaning',
    tagline: 'Professional home & commercial cleaning',
    description:
      'Standard cleans, deep cleans, end-of-lease, move-in, commercial, carpet, window, and post-renovation cleaning — our professional cleaners leave every space spotless.',
    accent: '#14B8A6',
    popularTasks: [
      { label: 'Standard Clean', preFilledTitle: 'Standard Clean' },
      { label: 'Deep Clean', preFilledTitle: 'Deep Clean' },
      { label: 'End of Lease Clean', preFilledTitle: 'End of Lease Clean' },
      { label: 'Move-in Clean', preFilledTitle: 'Move-in Clean' },
      { label: 'Commercial Clean', preFilledTitle: 'Commercial Clean' },
      { label: 'Carpet Clean', preFilledTitle: 'Carpet Clean' },
      { label: 'Window Clean', preFilledTitle: 'Window Clean' },
      { label: 'Spring Clean', preFilledTitle: 'Spring Clean' },
      { label: 'Post-Renovation Clean', preFilledTitle: 'Post-Renovation Clean' },
    ],
    howItWorks: [
      { title: 'Choose your clean type', desc: 'Select from standard, deep, end-of-lease, or other cleaning types to match your needs.' },
      { title: 'Customise your tasks', desc: 'Pick rooms and tasks from our checklist — we tailor the quote to exactly what you need.' },
      { title: 'Cleaner arrives', desc: 'A professional, vetted cleaner arrives at your scheduled time to make your space shine.' },
    ],
  },
  {
    slug: 'waste-removal',
    category: 'waste_removal',
    label: 'Waste Removal',
    tagline: 'General & green waste disposal services',
    description:
      'General household waste, green waste, construction debris — our waste removal teams handle collection and responsible disposal so you don\'t have to worry.',
    accent: '#F97316',
    popularTasks: [
      { label: 'General Waste Removal', preFilledTitle: 'General Waste Removal' },
      { label: 'Green Waste Removal', preFilledTitle: 'Green Waste Removal' },
    ],
    howItWorks: [
      { title: 'Describe the waste', desc: 'Tell us the type and approximate volume of waste. Photos help us estimate accurately.' },
      { title: 'Instant pricing', desc: 'Get a transparent quote based on waste type, volume, and your location.' },
      { title: 'Removal team dispatched', desc: 'A professional team arrives to collect and responsibly dispose of your waste.' },
    ],
  },
  {
    slug: 'other',
    category: 'other',
    label: 'Other',
    tagline: 'Jobs that do not fit another category',
    description:
      'Describe a job that does not match one of the listed service categories and we will help identify the right service.',
    accent: '#71717A',
    popularTasks: [
      { label: 'Describe another job', preFilledTitle: 'Other service request' },
    ],
    howItWorks: [
      { title: 'Describe your job', desc: 'Tell us what you need done and include clear photos where possible.' },
      { title: 'Review the service match', desc: 'We assess the request and identify the most appropriate service path.' },
      { title: 'Get connected', desc: 'An eligible service provider can then be matched to the job.' },
    ],
  },
]

export function getServiceBySlug(slug: string): ServiceMeta | undefined {
  return SERVICE_DATA.find((s) => s.slug === slug)
}

export function getServiceByCategory(category: JobCategory): ServiceMeta | undefined {
  return SERVICE_DATA.find((s) => s.category === category)
}
