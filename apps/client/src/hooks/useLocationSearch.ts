import { useState, useEffect, useRef } from 'react'
import { searchLocation, type Suggestion } from '../lib/location'

export function useLocationSearch(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    if (!query.trim()) {
      setSuggestions([])
      return
    }

    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchLocation(query)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  return { suggestions, loading }
}
