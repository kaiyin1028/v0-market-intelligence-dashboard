'use client'

import { useState, useEffect } from 'react'
import { getBaseUrl } from '@/lib/api'

export type AIStatus = 'online' | 'offline' | 'fallback'

export function useAIStatus(pollIntervalMs = 15000) {
  const [status, setStatus] = useState<AIStatus>('offline')
  const [model, setModel] = useState<string>('')
  const [effectiveModel, setEffectiveModel] = useState<string>('')
  const [provider, setProvider] = useState<string>('ollama')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const res = await fetch(`${getBaseUrl()}/ai/status`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json()
            setModel(data.model || '')
            setEffectiveModel(data.effective_model || data.model || '')
            setProvider(data.provider || 'ollama')
            if (data.status === 'online') {
              setStatus('online')
            } else if (data.status === 'degraded') {
              setStatus('fallback')
            } else {
              setStatus('offline')
            }
          } else {
            setStatus('offline')
          }
        }
      } catch {
        if (!cancelled) {
          setStatus('offline')
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

  return { status, model, effectiveModel, provider }
}
