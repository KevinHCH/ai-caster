import { useState, useEffect } from "react"
export function useDebounce(term: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(term)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(term)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [term, delay])

  return debouncedValue
}
