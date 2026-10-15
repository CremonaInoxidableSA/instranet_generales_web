"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import { useAuth } from "@/context/AuthProvider"
import { Conceptos, Moneda, MedioPago, Viaje } from "@/types/types"

function useGenericToggleList<T extends Record<string, unknown>>({
  endpoint,
  enableEndpoint,
  disableEndpoint,
  keyName,
  entityLabel,
}: {
  endpoint: string
  enableEndpoint: string
  disableEndpoint: string
  keyName: string
  entityLabel: string
}) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, authLoading } = useAuth()
  const mountedRef = useRef(true)

  const fetchItems = useCallback(async () => {
    if (authLoading) return
    if (!user) {
      setItems([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithConnectionCheck(endpoint)
      if (!response.ok) {
        throw new Error(`Error al obtener ${entityLabel}`)
      }

      const body = await response.json()
      const list = Array.isArray(body?.data) ? body.data : body

      if (!mountedRef.current) return
      setItems(Array.isArray(list) ? (list as T[]) : [])
    } catch (err: unknown) {
      if (!mountedRef.current) return

      setItems([])
      setError(
        err instanceof Error ? err.message : `Error al obtener ${entityLabel}`
      )
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [authLoading, endpoint, entityLabel, user])

  const habilitarItem = useCallback(
    async (id: number) => {
      try {
        const resp = await fetchWithConnectionCheck(enableEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [keyName]: id }),
        })

        if (!resp.ok) throw new Error(`Error al habilitar ${entityLabel}`)
        await fetchItems()
        return true
      } catch {
        return false
      }
    },
    [enableEndpoint, entityLabel, fetchItems, keyName]
  )

  const deshabilitarItem = useCallback(
    async (id: number) => {
      try {
        const resp = await fetchWithConnectionCheck(disableEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [keyName]: id }),
        })

        if (!resp.ok) throw new Error(`Error al deshabilitar ${entityLabel}`)
        await fetchItems()
        return true
      } catch {
        return false
      }
    },
    [disableEndpoint, entityLabel, fetchItems, keyName]
  )

  useEffect(() => {
    mountedRef.current = true

    if (authLoading || !user) {
      return () => {
        mountedRef.current = false
      }
    }

    const timeoutId = window.setTimeout(() => {
      void fetchItems()
    }, 0)

    return () => {
      mountedRef.current = false
      window.clearTimeout(timeoutId)
    }
  }, [authLoading, fetchItems, user])

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    habilitarItem,
    deshabilitarItem,
  }
}

export function useMonedas() {
  const {
    items: monedas,
    loading,
    error,
    refresh,
    habilitarItem,
    deshabilitarItem,
  } = useGenericToggleList<Moneda>({
    endpoint: "/api/generales/monedas/lista",
    enableEndpoint: "/api/generales/monedas/habilitar",
    disableEndpoint: "/api/generales/monedas/deshabilitar",
    keyName: "id_moneda",
    entityLabel: "moneda",
  })

  const crearMoneda = useCallback(
    async (nombre: string) => {
      try {
        const resp = await fetchWithConnectionCheck(
          "/api/generales/monedas/crear",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre }),
          }
        )

        if (!resp.ok) throw new Error("Error al crear moneda")
        await refresh()
        return true
      } catch {
        return false
      }
    },
    [refresh]
  )

  return {
    monedas,
    loading,
    error,
    refresh,
    habilitarMoneda: habilitarItem,
    deshabilitarMoneda: deshabilitarItem,
    crearMoneda,
  }
}

export function useViajes() {
  const {
    items: viajes,
    loading,
    error,
    refresh,
    habilitarItem,
    deshabilitarItem,
  } = useGenericToggleList<Viaje>({
    endpoint: "/api/generales/viajes/lista",
    enableEndpoint: "/api/generales/viajes/habilitar",
    disableEndpoint: "/api/generales/viajes/deshabilitar",
    keyName: "id_viaje",
    entityLabel: "viaje",
  })

  const crearViaje = useCallback(
    async (nombre_viaje: string, id_moneda: number) => {
      try {
        const resp = await fetchWithConnectionCheck(
          "/api/generales/viajes/crear",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_viaje, id_moneda }),
          }
        )

        if (!resp.ok) throw new Error("Error al crear viaje")
        await refresh()
        return true
      } catch {
        return false
      }
    },
    [refresh]
  )

  return {
    viajes,
    loading,
    error,
    refresh,
    habilitarViaje: habilitarItem,
    deshabilitarViaje: deshabilitarItem,
    crearViaje,
  }
}

export function useMediosPago() {
  const {
    items: mediosPago,
    loading,
    error,
    refresh,
    habilitarItem,
    deshabilitarItem,
  } = useGenericToggleList<MedioPago>({
    endpoint: "/api/generales/medios-pago/lista",
    enableEndpoint: "/api/generales/medios-pago/habilitar",
    disableEndpoint: "/api/generales/medios-pago/deshabilitar",
    keyName: "id_medio_pago",
    entityLabel: "medio de pago",
  })

  const crearMedioPago = useCallback(
    async (nombre: string) => {
      try {
        const resp = await fetchWithConnectionCheck(
          "/api/generales/medios-pago/crear",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre }),
          }
        )

        if (!resp.ok) throw new Error("Error al crear medio de pago")
        await refresh()
        return true
      } catch {
        return false
      }
    },
    [refresh]
  )

  return {
    mediosPago,
    loading,
    error,
    refresh,
    habilitarMedioPago: habilitarItem,
    deshabilitarMedioPago: deshabilitarItem,
    crearMedioPago,
  }
}

export function useConceptos() {
  const {
    items: conceptos,
    loading,
    error,
    refresh,
    habilitarItem,
    deshabilitarItem,
  } = useGenericToggleList<Conceptos>({
    endpoint: "/api/generales/conceptos/lista",
    enableEndpoint: "/api/generales/conceptos/habilitar",
    disableEndpoint: "/api/generales/conceptos/deshabilitar",
    keyName: "id_concepto",
    entityLabel: "concepto",
  })

  const crearConcepto = useCallback(
    async (nombre: string) => {
      try {
        const resp = await fetchWithConnectionCheck(
          "/api/generales/conceptos/crear",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre }),
          }
        )

        if (!resp.ok) throw new Error("Error al crear concepto")
        await refresh()
        return true
      } catch {
        return false
      }
    },
    [refresh]
  )

  return {
    conceptos,
    loading,
    error,
    refresh,
    habilitarConcepto: habilitarItem,
    deshabilitarConcepto: deshabilitarItem,
    crearConcepto,
  }
}
