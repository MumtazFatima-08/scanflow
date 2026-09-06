import { useEffect, useRef } from 'react'

export function useScanLog(dependency) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [dependency])

  return containerRef
}
