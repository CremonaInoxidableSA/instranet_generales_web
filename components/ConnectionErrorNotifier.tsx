"use client"

import { useConnection } from "@/context/connectionContext"
import { useEffect, useRef } from "react"
import { toast } from "@/components/ui/toast"

export function ConnectionErrorNotifier() {
  const { isConnectionError, connectionErrors } = useConnection()
  const previousSourcesRef = useRef<string[]>([])

  useEffect(() => {
    if (!isConnectionError) {
      previousSourcesRef.current.forEach((source) => {
        toast.add({
          type: "error",
          description: `connection-error-${source}`,
        })
      })
      previousSourcesRef.current = []
      return
    }

    const currentSources = connectionErrors.map((error) => error.apiSource)
    const previousSources = previousSourcesRef.current

    previousSources
      .filter(
        (source): source is string => !currentSources.includes(source as never)
      )
      .forEach((source) => {
        toast.add({
          type: "error",
          description: `connection-error-${source}`,
        })
      })

    currentSources.forEach((source) => {
      const error = connectionErrors.find((item) => item.apiSource === source)
      if (!error) return

      toast.add({
        type: "error",
        description: `connection-error-${error.message}`,
      })
    })

    previousSourcesRef.current = currentSources
  }, [connectionErrors, isConnectionError])

  return null
}
