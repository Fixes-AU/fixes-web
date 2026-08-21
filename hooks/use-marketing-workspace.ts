'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { ApiError } from '@/lib/api'
import {
  DiscountCode, MarketingAccess, MarketingCampaign, marketingApi,
} from '@/lib/marketing'

export interface MarketingWorkspaceState {
  access: MarketingAccess | null
  campaigns: MarketingCampaign[]
  selectedCampaign: MarketingCampaign | null
  codes: DiscountCode[]
  statusFilter: string
  search: string
  page: number
  totalPages: number
  total: number
  loading: boolean
  refreshing: boolean
  detailLoading: boolean
  mutating: boolean
  stale: boolean
  error: ApiError | null
}

type Action =
  | { type: 'LOAD_START'; refreshing: boolean }
  | { type: 'LOAD_SUCCESS'; access: MarketingAccess; campaigns: MarketingCampaign[]; total: number; totalPages: number }
  | { type: 'LOAD_ERROR'; error: ApiError }
  | { type: 'SELECT_START' }
  | { type: 'SELECT_SUCCESS'; campaign: MarketingCampaign; codes: DiscountCode[] }
  | { type: 'SELECT_ERROR'; error: ApiError }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_FILTER'; statusFilter: string }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'MUTATION_START' }
  | { type: 'MUTATION_END' }
  | { type: 'MARK_STALE' }
  | { type: 'CLEAR_ERROR' }

export const initialMarketingWorkspaceState: MarketingWorkspaceState = {
  access: null, campaigns: [], selectedCampaign: null, codes: [],
  statusFilter: 'all', search: '', page: 1, totalPages: 1, total: 0,
  loading: true, refreshing: false, detailLoading: false, mutating: false, stale: false, error: null,
}

export function marketingWorkspaceReducer(state: MarketingWorkspaceState, action: Action): MarketingWorkspaceState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: !action.refreshing, refreshing: action.refreshing, stale: action.refreshing ? state.stale : false, error: null }
    case 'LOAD_SUCCESS':
      return {
        ...state, loading: false, refreshing: false, stale: false, error: null, access: action.access,
        campaigns: action.campaigns, total: action.total, totalPages: Math.max(1, action.totalPages),
      }
    case 'LOAD_ERROR':
      return { ...state, loading: false, refreshing: false, stale: state.campaigns.length > 0, error: action.error }
    case 'SELECT_START':
      return { ...state, detailLoading: true, error: null }
    case 'SELECT_SUCCESS':
      return { ...state, detailLoading: false, selectedCampaign: action.campaign, codes: action.codes, error: null, stale: false }
    case 'SELECT_ERROR':
      return { ...state, detailLoading: false, stale: Boolean(state.selectedCampaign), error: action.error }
    case 'CLEAR_SELECTION':
      return { ...state, selectedCampaign: null, codes: [], detailLoading: false }
    case 'SET_FILTER':
      return { ...state, statusFilter: action.statusFilter, page: 1 }
    case 'SET_SEARCH':
      return { ...state, search: action.search, page: 1 }
    case 'SET_PAGE':
      return { ...state, page: action.page }
    case 'MUTATION_START':
      return { ...state, mutating: true, error: null }
    case 'MUTATION_END':
      return { ...state, mutating: false }
    case 'MARK_STALE':
      return { ...state, stale: true }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const normalizeError = (cause: unknown) => cause instanceof ApiError
  ? cause
  : new ApiError('Marketing data could not be loaded.', 500, { code: 'REQUEST_FAILED' })

export function useMarketingWorkspace() {
  const [state, dispatch] = useReducer(marketingWorkspaceReducer, initialMarketingWorkspaceState)
  const listRequest = useRef(0)
  const detailRequest = useRef(0)

  const loadCampaigns = useCallback(async (refreshing = false) => {
    const request = ++listRequest.current
    dispatch({ type: 'LOAD_START', refreshing })
    const params = new URLSearchParams({ page: String(state.page), limit: '25' })
    if (state.statusFilter !== 'all') params.set('status', state.statusFilter)
    if (state.search.trim()) params.set('search', state.search.trim())
    try {
      const [accessResponse, campaignResponse] = await Promise.all([
        marketingApi.access(), marketingApi.campaigns(params),
      ])
      if (request !== listRequest.current) return
      dispatch({
        type: 'LOAD_SUCCESS', access: accessResponse.data.access,
        campaigns: campaignResponse.data.campaigns,
        total: campaignResponse.data.pagination.total,
        totalPages: campaignResponse.data.pagination.totalPages,
      })
    } catch (cause) {
      if (request === listRequest.current) dispatch({ type: 'LOAD_ERROR', error: normalizeError(cause) })
    }
  }, [state.page, state.search, state.statusFilter])

  const selectCampaign = useCallback(async (campaignId: string) => {
    const request = ++detailRequest.current
    dispatch({ type: 'SELECT_START' })
    try {
      const [campaignResponse, codeResponse] = await Promise.all([
        marketingApi.campaign(campaignId), marketingApi.codes(campaignId),
      ])
      if (request !== detailRequest.current) return
      dispatch({ type: 'SELECT_SUCCESS', campaign: campaignResponse.data.campaign, codes: codeResponse.data.codes })
    } catch (cause) {
      if (request === detailRequest.current) dispatch({ type: 'SELECT_ERROR', error: normalizeError(cause) })
    }
  }, [])

  const refreshSelected = useCallback(async () => {
    if (state.selectedCampaign) await selectCampaign(state.selectedCampaign._id)
  }, [selectCampaign, state.selectedCampaign])

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>) => {
    dispatch({ type: 'MUTATION_START' })
    try {
      const result = await operation()
      await loadCampaigns(true)
      await refreshSelected()
      return result
    } catch (cause) {
      const error = normalizeError(cause)
      if (error.code === 'CAMPAIGN_VERSION_CONFLICT' || error.code === 'VERSION_CONFLICT') {
        dispatch({ type: 'MARK_STALE' })
      }
      dispatch({ type: 'LOAD_ERROR', error })
      throw error
    } finally {
      dispatch({ type: 'MUTATION_END' })
    }
  }, [loadCampaigns, refreshSelected])

  useEffect(() => { void loadCampaigns() }, [loadCampaigns])

  return {
    state,
    actions: {
      loadCampaigns,
      selectCampaign,
      refreshSelected,
      clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
      runMutation,
      setStatusFilter: (statusFilter: string) => dispatch({ type: 'SET_FILTER', statusFilter }),
      setSearch: (search: string) => dispatch({ type: 'SET_SEARCH', search }),
      setPage: (page: number) => dispatch({ type: 'SET_PAGE', page }),
      clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    },
  }
}
