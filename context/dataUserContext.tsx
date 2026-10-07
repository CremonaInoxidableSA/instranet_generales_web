import { useEffect, useState, useCallback, useRef } from "react"
import { useUser } from "@/context/userContext"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import type { DetalleTarea, TareaUsuario } from "@/types/types"

export type { DetalleTarea, TareaUsuario } from "@/types/types"

export function useTareasUsuario(options?: { autoFetch?: boolean }) {
  const { autoFetch = true } = options ?? {}
  const { id_current_user } = useUser()
  const [tareas, setTareas] = useState<TareaUsuario[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        `/api/listas/lista-tareasUsuarioLogueado?id_current_user=${id_current_user}`,
        { cache: "no-store" }
      )
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTareas(data.tareas ?? [])
    } catch {
      setError("No se pudo cargar las tareas")
    } finally {
      setLoading(false)
    }
  }, [id_current_user])

  const removeTareaLocal = useCallback((id: number) => {
    setTareas((prev) => prev.filter((t) => t.id_tarea !== id))
  }, [])

  useEffect(() => {
    if (!autoFetch) return

    if (!isMountedRef.current) {
      isMountedRef.current = true
      void fetchData()
    }

    return () => {
      isMountedRef.current = false
    }
  }, [autoFetch, fetchData])

  return { tareas, loading, error, refetch: fetchData, removeTareaLocal }
}

export function useDetalleTarea(id_tarea: number | null) {
  const [detalle, setDetalle] = useState<DetalleTarea | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetalle = useCallback(async () => {
    if (id_tarea === null) {
      setDetalle(null)
      return
    }
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        `/api/detalles/detalles-tareaActivaSeleccionada?id_tarea=${id_tarea}`
      )
      if (!response.ok) throw new Error("Error al obtener detalle")
      const data: DetalleTarea = await response.json()
      setDetalle(data)
    } catch {
      setError("No se pudo cargar el detalle de la tarea")
    } finally {
      setLoading(false)
    }
  }, [id_tarea])

  useEffect(() => {
    void (async () => {
      await fetchDetalle()
    })()
    return () => {}
  }, [fetchDetalle])

  return { detalle, loading, error, refetch: fetchDetalle }
}

export function useDetalleTareaFinalizada(id_tarea: number | null) {
  const [detalle, setDetalle] = useState<DetalleTarea | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetalle = useCallback(async () => {
    if (id_tarea === null) {
      setDetalle(null)
      return
    }
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        `/api/detalles/detalles-tareaFinalizada?id_tarea=${id_tarea}`
      )
      if (!response.ok) throw new Error("Error al obtener detalle")
      const data: DetalleTarea = await response.json()
      setDetalle(data)
    } catch {
      setError("No se pudo cargar el detalle de la tarea")
    } finally {
      setLoading(false)
    }
  }, [id_tarea])

  useEffect(() => {
    void (async () => {
      await fetchDetalle()
    })()
    return () => {}
  }, [fetchDetalle])

  return { detalle, loading, error, refetch: fetchDetalle }
}
