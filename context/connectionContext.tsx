"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  subscribeToConnectionError,
  resetConnectionError as resetConnectionErrorManager,
} from "@/lib/connectionManager"
import type { ConnectionContextType, ConnectionErrorState } from "@/types/types"

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
)

export function ConnectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [connectionError, setConnectionErrorState] =
    useState<ConnectionErrorState>({
      hasError: false,
      failedApis: [],
      messages: [],
    })

  useEffect(() => {
    const unsubscribe = subscribeToConnectionError((state) => {
      setConnectionErrorState(state)
    })

    return unsubscribe
  }, [])

  const resetConnectionError = () => {
    resetConnectionErrorManager()
  }

  return (
    <ConnectionContext.Provider
      value={{
        isConnectionError: connectionError.hasError,
        connectionErrors: connectionError.failedApis.map(
          (apiSource, index) => ({
            apiSource,
            message:
              connectionError.messages[index] ?? "Error de conexión con la api",
          })
        ),
        resetConnectionError,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error("useConnection debe usarse dentro de ConnectionProvider")
  }
  return context
}
