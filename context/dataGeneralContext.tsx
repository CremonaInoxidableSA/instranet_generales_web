"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import { useAuth } from "@/context/AuthProvider"
import type {
  FiltrosMonitoreo,
  Labor,
  LaborProducto,
  Operario,
  Producto,
  Sector,
} from "@/types/types"

export type {
  FiltrosMonitoreo,
  Labor,
  LaborProducto,
  Operario,
  Producto,
  Sector,
} from "@/types/types"

//------------------------------------CARGAR NUEVA TAREA------------------------------------//

export function useSectores() {
  const { loading: authLoading, user } = useAuth()
  const [sectores, setSectores] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    async function fetchData() {
      try {
        const response = await fetchWithConnectionCheck(
          "/api/listas/lista-sectores"
        )
        if (!response.ok) throw new Error("Error al obtener sectores")
        const data: Sector[] = await response.json()
        if (mountedRef.current) setSectores(data)
      } catch {
        if (mountedRef.current)
          setError("No se pudo cargar la lista de sectores")
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, user])

  useEffect(() => {
    if (!authLoading && !user && mountedRef.current) {
      setLoading(false)
    }
  }, [authLoading, user])

  return { sectores, loading, error }
}

export function useProductosSector(id_sector: number | null) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id_sector === null) return
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetchWithConnectionCheck(
          `/api/listas/lista-productosSector?id_sector=${id_sector}`
        )
        if (!response.ok) throw new Error("Error al obtener productos")
        const data: Producto[] = await response.json()
        setProductos(data)
      } catch {
        setError("No se pudo cargar la lista de productos")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id_sector])

  return { productos, loading, error }
}

export function useProductos() {
  const { loading: authLoading, user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        "/api/listas/lista-productos"
      )
      if (!response.ok) throw new Error("Error al obtener productos")
      const data: Producto[] = await response.json()
      setProductos(data)
    } catch {
      setError("No se pudo cargar la lista de productos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || initializedRef.current) return
    initializedRef.current = true
    if (!user) {
      void (async () => {
        setLoading(false)
      })()
      return
    }

    void (async () => {
      await fetchData()
    })()
  }, [authLoading, user, fetchData])

  return { productos, loading, error, refetch: fetchData }
}

export function useLabores(
  id_sector: number | null,
  id_producto: number | null
) {
  const [labores, setLabores] = useState<Labor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id_sector === null || id_producto === null) return

    void (async () => {
      setLabores([])
      setError(null)
      setLoading(true)

      try {
        const response = await fetchWithConnectionCheck(
          `/api/listas/lista-labores?id_sector=${id_sector}&id_producto=${id_producto}`
        )
        if (!response.ok) throw new Error("Error al obtener labores")
        const data: Labor[] = await response.json()
        setLabores(data)
      } catch {
        setError("No se pudo cargar la lista de labores")
        setLabores([])
      } finally {
        setLoading(false)
      }
    })()
  }, [id_sector, id_producto])

  return { labores, loading, error }
}

const GRUPO_DISPLAY: Record<string, string> = {
  GRUPO_ENCARGADOS_PRODUCCION: "ENCARGADO",
  GRUPO_OPERARIOS_PRODUCCION: "OPERARIO",
}

export function useOperarios() {
  const { loading: authLoading, user } = useAuth()
  const [operarios, setOperarios] = useState<Operario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        "/api/auth/lista-operarios",
        { cache: "no-store" }
      )
      if (!response.ok) throw new Error("Error al obtener operarios")
      const data = await response.json()
      const operariosFormateados = data.map(
        (o: {
          id: number
          nombre: string
          apellido: string
          grupo: string
        }) => ({
          ...o,
          nombre_completo: `${o.apellido} ${o.nombre}`,
          grupo_display: GRUPO_DISPLAY[o.grupo] ?? o.grupo.toUpperCase(),
        })
      )
      setOperarios(operariosFormateados)
    } catch {
      setError("No se pudo cargar la lista de operarios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || initializedRef.current) return
    initializedRef.current = true
    if (!user) {
      void (async () => {
        setLoading(false)
      })()
      return
    }

    void (async () => {
      await fetchData()
    })()
  }, [authLoading, user, fetchData])

  return { operarios, loading, error, refetch: fetchData }
}

//------------------------------------LABORES POR PRODUCTO------------------------------------//

export function useLaborresProducto(id_producto: number | null) {
  const [labores, setLabores] = useState<LaborProducto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (id_producto === null) {
      setLabores([])
      return
    }
    setLoading(true)
    try {
      const response = await fetchWithConnectionCheck(
        `/api/listas/lista-labores-producto?id_producto=${id_producto}`
      )
      if (!response.ok) throw new Error("Error al obtener labores")
      const data: LaborProducto[] = await response.json()
      setLabores(data)
    } catch {
      setError("No se pudo cargar la lista de labores")
    } finally {
      setLoading(false)
    }
  }, [id_producto])

  useEffect(() => {
    if (id_producto === null) return
    void (async () => {
      await fetchData()
    })()
  }, [fetchData, id_producto])

  return { labores, loading, error, refetch: fetchData }
}

//------------------------------------FILTROS MONITOREO------------------------------------//

const FILTROS_EMPTY: FiltrosMonitoreo = {
  numeros_op: [],
  numeros_plano: [],
  operarios: [],
  sectores: [],
}

export function useFiltrosEnCurso() {
  const { loading: authLoading, user } = useAuth()
  const [filtros, setFiltros] = useState<FiltrosMonitoreo>(FILTROS_EMPTY)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (authLoading || initializedRef.current) return
    initializedRef.current = true
    if (!user) return

    async function fetchData() {
      try {
        const res = await fetchWithConnectionCheck("/api/filtros/tareasEnCurso")
        if (!res.ok) throw new Error()
        const data: FiltrosMonitoreo = await res.json()
        setFiltros(data)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, user])

  return { filtros, loading }
}

export function useFiltrosFinalizadas(
  fecha_inicio?: string,
  fecha_fin?: string,
  refreshVersion?: number
) {
  const { loading: authLoading, user } = useAuth()
  const [filtros, setFiltros] = useState<FiltrosMonitoreo>(FILTROS_EMPTY)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      if (!initializedRef.current) {
        initializedRef.current = true
        setLoading(false)
      }
      return
    }
    if (!fecha_inicio || !fecha_fin) return

    initializedRef.current = true
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          fecha_inicio: fecha_inicio!,
          fecha_fin: fecha_fin!,
        })
        const res = await fetchWithConnectionCheck(
          `/api/filtros/tareasFinalizadas?${params}`
        )
        if (!res.ok) throw new Error()
        const data: FiltrosMonitoreo = await res.json()
        setFiltros(data)
      } catch {
        setFiltros(FILTROS_EMPTY)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, user, fecha_inicio, fecha_fin, refreshVersion])

  return { filtros, loading }
}
