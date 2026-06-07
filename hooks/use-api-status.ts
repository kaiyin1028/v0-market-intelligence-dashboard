'use client'

import { useState, useEffect } from 'react'
import { isFallbackUsed, getBaseUrl } from '@/lib/api'

export type ApiStatus = 'connected' | 'mock' | 'unavailable'

export function useApiStatus(pollIntervalMs = 10000) {
  const [status, setStatus] = useState<ApiStatus>('unavailable')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const res = await fetch(`${getBaseUrl().replace('/api/v1', '')}/health`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!cancelled) {
          setStatus(res.ok ? 'connected' : 'unavailable')
        }
      } catch {
        if (!cancelled) {
          setStatus(isFallbackUsed() ? 'mock' : 'unavailable')
        }
      }
    }

    check()
    const id = setInterval(check, pollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [pollIntervalMs])

  return status
}
