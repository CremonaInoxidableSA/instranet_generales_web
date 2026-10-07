"use client"

import { useConnection } from "@/context/connectionContext"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function ConnectionErrorNotifier() {
  const { isConnectionError, connectionErrors } = useConnection()
  const previousSourcesRef = useRef<string[]>([])

  useEffect(() => {
    if (!isConnectionError) {
      previousSourcesRef.current.forEach((source) => {
        toast.dismiss(`connection-error-${source}`)
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
        toast.dismiss(`connection-error-${source}`)
      })

    currentSources.forEach((source) => {
      const error = connectionErrors.find((item) => item.apiSource === source)
      if (!error) return

      toast.error(error.message, {
        id: `connection-error-${source}`,
        duration: Infinity,
        dismissible: false,
        style: {
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          fontWeight: "600",
          fontSize: "16px",
        },
      })
    })

    previousSourcesRef.current = currentSources
  }, [connectionErrors, isConnectionError])

  return null
}
