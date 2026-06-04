'use client'

import { DollarSign, Clock } from 'lucide-react'
import { CLEANING_TYPE_LABELS } from '@/lib/constants'

interface CleaningPricing {
  ratePerHour: number | null
  estimatedHours: number | null
  totalEstimate: number | null
  actualHours: number | null
  finalAmount: number | null
}

interface CleaningQuoteCardProps {
  cleaningType: string
  pricing: CleaningPricing
  jobStatus: string
}

export default function CleaningQuoteCard({ cleaningType, pricing, jobStatus }: CleaningQuoteCardProps) {
  const isCompleted = jobStatus === 'completed'
  const displayHours = isCompleted && pricing.actualHours ? pricing.actualHours : pricing.estimatedHours
  const displayAmount = isCompleted && pricing.finalAmount ? pricing.finalAmount : pricing.totalEstimate
  const label = CLEANING_TYPE_LABELS[cleaningType] || cleaningType

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--upwork-navy)] mb-3 flex items-center gap-1.5">
        <DollarSign className="w-4 h-4 text-gray-400" />
        Cleaning Quote
      </h3>

      <div className="mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          {label}
        </span>
      </div>

      <div className="space-y-2">
        {pricing.ratePerHour != null && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--upwork-gray)]">Hourly Rate</span>
            <span className="font-medium text-[var(--upwork-navy)]">${pricing.ratePerHour.toFixed(2)}/hr</span>
          </div>
        )}

        {displayHours != null && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--upwork-gray)]">
              {isCompleted && pricing.actualHours ? 'Actual Hours' : 'Estimated Hours'}
            </span>
            <span className="font-medium text-[var(--upwork-navy)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {displayHours}h
            </span>
          </div>
        )}

        {isCompleted && pricing.estimatedHours && pricing.actualHours && pricing.actualHours !== pricing.estimatedHours && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Original Estimate</span>
            <span className="text-gray-400 line-through">{pricing.estimatedHours}h</span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
          <span className="font-semibold text-[var(--upwork-navy)]">
            {isCompleted ? 'Final Amount' : 'Estimated Total'}
          </span>
          <span className="font-bold text-[var(--upwork-green)] text-lg">
            ${displayAmount?.toFixed(2) || '0.00'}
          </span>
        </div>

        {!isCompleted && (
          <p className="text-xs text-[var(--upwork-gray)] pt-1">
            Final amount based on actual hours worked. GST included.
          </p>
        )}
      </div>
    </div>
  )
}
