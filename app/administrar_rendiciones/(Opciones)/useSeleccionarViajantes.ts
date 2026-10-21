"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "@/components/ui/toast"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import { normalizar, toEmpleadoRow } from "./mappers"
import type { EmpleadoRow, Viajante } from "./types"

const FILAS_POR_PAGINA = 6

export function useSeleccionarViajantes(initialSelected: Viajante[]) {
  const [empleados, setEmpleados] = useState<EmpleadoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroInput, setFiltroInput] = useState("")
  const [filtro, setFiltro] = useState("")
  const [pagina, setPagina] = useState(0)
  const [seleccion, setSeleccion] = useState<Map<string, Viajante>>(
    () =>
      new Map<string, Viajante>(
        initialSelected.map((v) => [v.id_usuario_viajante, v])
      )
  )

  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      try {
        const response = await fetchWithConnectionCheck(
          "/api/auth/lista-empleados"
        )
        if (!response.ok) throw new Error("Error al obtener empleados")
        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []
        if (!cancelled) {
          setEmpleados(list.map(toEmpleadoRow).filter((row) => row.id !== ""))
        }
      } catch {
        if (!cancelled) {
          setEmpleados([])
          toast.add({
            type: "error",
            description: "No se pudieron cargar los empleados",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void cargar()
    return () => {
      cancelled = true
    }
  }, [])

  const filtrados = useMemo(() => {
    const q = normalizar(filtro.trim())
    if (!q) return empleados
    return empleados.filter((row) =>
      normalizar(`${row.nombre} ${row.apellido} ${row.legajo}`).includes(q)
    )
  }, [empleados, filtro])

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / FILAS_POR_PAGINA)
  )
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const filasPagina = filtrados.slice(
    paginaActual * FILAS_POR_PAGINA,
    (paginaActual + 1) * FILAS_POR_PAGINA
  )

  const toggle = (row: EmpleadoRow) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      if (next.has(row.id)) {
        next.delete(row.id)
      } else {
        next.set(row.id, {
          id_usuario_viajante: row.id,
          nombre_usuario_viajante: row.nombre,
          apellido_usuario_viajante: row.apellido,
          legajo_usuario_viajante: row.legajo,
        })
      }
      return next
    })
  }

  const aplicarFiltro = () => {
    setPagina(0)
    setFiltro(filtroInput)
  }

  const limpiarFiltro = () => {
    setFiltroInput("")
    setFiltro("")
    setPagina(0)
  }

  const anterior = () => setPagina(paginaActual - 1)
  const siguiente = () => setPagina(paginaActual + 1)

  const getSeleccionados = () => Array.from(seleccion.values())

  return {
    // state
    empleados,
    loading,
    filtroInput,
    setFiltroInput,
    seleccion,
    // derived
    filasPagina,
    paginaActual,
    totalPaginas,
    seleccionadosCount: seleccion.size,
    // actions
    toggle,
    aplicarFiltro,
    limpiarFiltro,
    anterior,
    siguiente,
    getSeleccionados,
  }
}

export type UseSeleccionarViajantesReturn = ReturnType<
  typeof useSeleccionarViajantes
>
