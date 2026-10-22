"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/components/ui/toast"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import {
  mapComentarioDelViaje,
  mapEmpleado,
  mapTicketDelViaje,
  mapTicketDetalle,
  mapViaticoDelViaje,
  mapViajeDelEmpleado,
  normalizar,
} from "./mappers"
import type {
  ComentarioDelViaje,
  Empleado,
  Moneda,
  TicketDelViaje,
  TicketDetalle,
  ViaticoDelViaje,
  ViaticoEditando,
  ViajeDelEmpleado,
} from "./types"

const FILAS_POR_PAGINA = 6

export function useVerRendiciones() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [viajes, setViajes] = useState<ViajeDelEmpleado[]>([])
  const [viajeSeleccionado, setViajeSeleccionado] = useState<number>()
  const [reciboSeleccionado, setReciboSeleccionado] = useState<number>()

  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [loadingViajes, setLoadingViajes] = useState(false)
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [loadingViaticos, setLoadingViaticos] = useState(false)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [loadingMonedas, setLoadingMonedas] = useState(false)

  const [comentarios, setComentarios] = useState<ComentarioDelViaje[]>([])
  const [viaticos, setViaticos] = useState<ViaticoDelViaje[]>([])
  const [tickets, setTickets] = useState<TicketDelViaje[]>([])
  const [ticketImagenes, setTicketImagenes] = useState<Record<number, string>>(
    {}
  )
  const [loadingTicketImagenes, setLoadingTicketImagenes] = useState<
    Record<number, boolean>
  >({})
  const [monedas, setMonedas] = useState<Moneda[]>([])

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [dialogComentarioAbierto, setDialogComentarioAbierto] = useState(false)
  const [dialogViaticoEdicionAbierto, setDialogViaticoEdicionAbierto] =
    useState(false)
  const [dialogAprobacionViaticoAbierto, setDialogAprobacionViaticoAbierto] =
    useState(false)
  const [dialogTicketDetalleAbierto, setDialogTicketDetalleAbierto] =
    useState(false)

  const [textoComentario, setTextoComentario] = useState("")
  const [ticketDetalle, setTicketDetalle] = useState<TicketDetalle | null>(null)
  const [loadingTicketDetalle, setLoadingTicketDetalle] = useState(false)
  const [viaticoEditando, setViaticoEditando] =
    useState<ViaticoEditando | null>(null)
  const [viaticoAprobacion, setViaticoAprobacion] =
    useState<ViaticoDelViaje | null>(null)

  const [filtroInput, setFiltroInput] = useState("")
  const [filtro, setFiltro] = useState("")
  const [pagina, setPagina] = useState(0)

  const empleadosFiltrados = useMemo(() => {
    const textoBusqueda = normalizar(filtro.trim())
    if (!textoBusqueda) return empleados
    return empleados.filter((empleado) =>
      normalizar(
        `${empleado.nombre} ${empleado.apellido} ${empleado.legajo}`.trim()
      ).includes(textoBusqueda)
    )
  }, [empleados, filtro])

  const totalPaginas = Math.max(
    1,
    Math.ceil(empleadosFiltrados.length / FILAS_POR_PAGINA)
  )
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const filasPagina = empleadosFiltrados.slice(
    paginaActual * FILAS_POR_PAGINA,
    (paginaActual + 1) * FILAS_POR_PAGINA
  )

  const empleadoSeleccionadoInfo = useMemo(
    () =>
      empleados.find((empleado) => empleado.id === empleadoSeleccionado) ??
      null,
    [empleados, empleadoSeleccionado]
  )

  const viajeActual = viajes[viajeSeleccionado ?? -1] ?? null
  const idViajeUsuarioActual = viajeActual?.id_viaje_usuario

  const viajesTags = viajes.map((viaje) => viaje.nombre_viaje)
  const viajesSubtitles = viajes.map((viaje) => `ID: ${viaje.id_viaje}`)

  const aplicarFiltro = () => {
    setPagina(0)
    setFiltro(filtroInput)
  }

  const limpiarFiltro = () => {
    setFiltroInput("")
    setFiltro("")
    setPagina(0)
  }

  const paginaAnterior = () => setPagina((actual) => Math.max(actual - 1, 0))

  const paginaSiguiente = () =>
    setPagina((actual) => Math.min(actual + 1, totalPaginas - 1))

  const cargarImagenTicket = async (idTicket: number) => {
    if (!idTicket) return

    setLoadingTicketImagenes((prev) => ({ ...prev, [idTicket]: true }))

    try {
      const response = await fetchWithConnectionCheck(
        `/api/generales/tickets/imagen?id_ticket=${encodeURIComponent(String(idTicket))}`
      )
      if (!response.ok) throw new Error("Error al obtener la imagen del ticket")

      const blob = await response.blob()
      if (blob.size === 0) throw new Error("Imagen vacía")

      const objectUrl = URL.createObjectURL(blob)
      setTicketImagenes((prev) => ({ ...prev, [idTicket]: objectUrl }))
    } catch {
      setTicketImagenes((prev) => {
        const next = { ...prev }
        delete next[idTicket]
        return next
      })
    } finally {
      setLoadingTicketImagenes((prev) => {
        const next = { ...prev }
        delete next[idTicket]
        return next
      })
    }
  }

  const cargarDetalleTicket = useCallback(async (idTicket: number) => {
    if (!idTicket) return

    try {
      setLoadingTicketDetalle(true)
      const response = await fetchWithConnectionCheck(
        `/api/generales/tickets/detalles?id_ticket=${encodeURIComponent(String(idTicket))}`
      )
      if (!response.ok)
        throw new Error("Error al obtener el detalle del ticket")
      const body = await response.json()
      const ticket =
        (body?.ticket && typeof body.ticket === "object"
          ? mapTicketDetalle(body.ticket as Record<string, unknown>)
          : null) ??
        (Array.isArray(body)
          ? mapTicketDetalle(body[0] as Record<string, unknown>)
          : null)

      if (!ticket) {
        throw new Error("No se encontró detalle del ticket")
      }

      setTicketDetalle(ticket)
    } catch {
      setTicketDetalle(null)
      toast.add({
        type: "error",
        description: "No se pudo cargar el detalle del recibo.",
      })
    } finally {
      setLoadingTicketDetalle(false)
    }
  }, [])

  const aprobarTicket = useCallback(async (idTicket: number) => {
    if (!idTicket) return

    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/tickets/aprobar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_ticket: Number(idTicket) }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : "No se pudo aprobar el recibo"
        )
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id_ticket === idTicket
            ? { ...ticket, estado: "APROBADO" }
            : ticket
        )
      )
      setTicketDetalle((prev) =>
        prev ? { ...prev, estado: "APROBADO" } : prev
      )
      setDialogTicketDetalleAbierto(false)
      setTicketDetalle(null)
      toast.add({
        type: "success",
        description: "Recibo aprobado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description: "No se pudo aprobar el recibo.",
      })
    }
  }, [])

  const cargarDetalleViaje = useCallback(async (idViajeUsuario: string) => {
    let comentariosNuevos: ComentarioDelViaje[] = []
    let viaticosNuevos: ViaticoDelViaje[] = []
    let ticketsNuevos: TicketDelViaje[] = []

    try {
      setLoadingComentarios(true)
      const response = await fetchWithConnectionCheck(
        `/api/generales/comentarios/lista?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`
      )
      if (!response.ok) throw new Error("Error al obtener comentarios")
      const body = await response.json()
      const list: Record<string, unknown>[] = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : []
      comentariosNuevos = list
        .map(mapComentarioDelViaje)
        .filter((x): x is ComentarioDelViaje => x !== null)
    } catch {
      comentariosNuevos = []
      toast.add({
        type: "error",
        description: "No se pudieron cargar los comentarios del viaje",
      })
    } finally {
      setLoadingComentarios(false)
    }

    try {
      setLoadingViaticos(true)
      const response = await fetchWithConnectionCheck(
        `/api/generales/viaticos/lista?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`
      )
      if (!response.ok) throw new Error("Error al obtener viaticos")
      const body = await response.json()
      const list: Record<string, unknown>[] = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : []
      viaticosNuevos = list
        .map(mapViaticoDelViaje)
        .filter((x): x is ViaticoDelViaje => x !== null)
    } catch {
      viaticosNuevos = []
      toast.add({
        type: "error",
        description: "No se pudieron cargar los viáticos del viaje",
      })
    } finally {
      setLoadingViaticos(false)
    }

    try {
      setLoadingTickets(true)
      const response = await fetchWithConnectionCheck(
        `/api/generales/tickets/lista?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`
      )
      if (!response.ok) throw new Error("Error al obtener tickets")
      const body = await response.json()
      const list: Record<string, unknown>[] = Array.isArray(body?.tickets)
        ? body.tickets
        : Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []
      ticketsNuevos = list
        .map(mapTicketDelViaje)
        .filter((x): x is TicketDelViaje => x !== null)
    } catch {
      ticketsNuevos = []
      toast.add({
        type: "error",
        description: "No se pudieron cargar los recibos del viaje",
      })
    } finally {
      setLoadingTickets(false)
    }

    setComentarios(comentariosNuevos)
    setViaticos(viaticosNuevos)
    setTickets(ticketsNuevos)
    setTicketImagenes({})

    for (const ticket of ticketsNuevos) {
      void cargarImagenTicket(ticket.id_ticket)
    }
  }, [])

  const guardarComentario = async () => {
    if (!idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "Seleccioná un viaje antes de agregar un comentario.",
      })
      return
    }
    const comentario = textoComentario.trim()
    if (!comentario) {
      toast.add({
        type: "error",
        description: "Escribí un comentario antes de guardar.",
      })
      return
    }
    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/comentarios/crear",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_viaje_usuario: Number(idViajeUsuarioActual),
            comentario,
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : "No se pudo crear el comentario"
        )
      }
      await cargarDetalleViaje(String(idViajeUsuarioActual))
      setTextoComentario("")
      setDialogComentarioAbierto(false)
      toast.add({
        type: "success",
        description: "Comentario agregado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description: "No se pudo guardar el comentario.",
      })
    }
  }

  const guardarViaticoEditado = async () => {
    if (!viaticoEditando || !idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "No hay un viático válido para editar.",
      })
      return
    }
    const idMoneda = Number(viaticoEditando.id_moneda)
    const montoEntregado = Number(viaticoEditando.monto_entregado || 0)
    const montoDevuelto = Number(viaticoEditando.monto_devuelto || 0)
    if (!Number.isFinite(idMoneda) || !Number.isFinite(montoEntregado)) {
      toast.add({
        type: "error",
        description: "Completá los campos del viático correctamente.",
      })
      return
    }
    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/viaticos/editar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_viatico: Number(viaticoEditando.id_viatico),
            id_moneda: idMoneda,
            monto_entregado: montoEntregado,
            monto_devuelto: montoDevuelto,
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : "No se pudo actualizar el viático"
        )
      }
      await cargarDetalleViaje(String(idViajeUsuarioActual))
      setDialogViaticoEdicionAbierto(false)
      setViaticoEditando(null)
      toast.add({
        type: "success",
        description: "Viático actualizado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description: "No se pudo actualizar el viático.",
      })
    }
  }

  const aprobarViatico = async (idViatico?: number) => {
    const idAprobacion = Number(idViatico ?? viaticoEditando?.id_viatico ?? 0)

    if (!idAprobacion || !idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "No hay un viático válido para aprobar.",
      })
      return
    }
    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/viaticos/aprobar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_viatico: idAprobacion,
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : "No se pudo aprobar el viático"
        )
      }
      await cargarDetalleViaje(String(idViajeUsuarioActual))
      setDialogViaticoEdicionAbierto(false)
      setDialogAprobacionViaticoAbierto(false)
      setViaticoEditando(null)
      setViaticoAprobacion(null)
      toast.add({
        type: "success",
        description: "Viático aprobado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description: "No se pudo aprobar el viático.",
      })
    }
  }

  const abrirDialogViajante = () => {
    setFiltroInput("")
    setFiltro("")
    setPagina(0)
    setDialogAbierto(true)
  }

  const cerrarDialogViajante = (open: boolean) => {
    setDialogAbierto(open)
    if (!open) {
      setFiltroInput("")
      setFiltro("")
      setPagina(0)
    }
  }

  const abrirDialogComentario = () => {
    if (!idViajeUsuarioActual) return
    setDialogComentarioAbierto(true)
  }

  const cerrarDialogComentario = (open: boolean) => {
    setDialogComentarioAbierto(open)
    if (!open) setTextoComentario("")
  }

  const cerrarDialogEdicion = (open: boolean) => {
    setDialogViaticoEdicionAbierto(open)
    if (!open) setViaticoEditando(null)
  }

  const cerrarDialogAprobacionViatico = (open: boolean) => {
    setDialogAprobacionViaticoAbierto(open)
    if (!open) setViaticoAprobacion(null)
  }

  const abrirEdicionViatico = (viatico: ViaticoDelViaje) => {
    setViaticoEditando({
      id_viatico: viatico.id_viatico,
      id_moneda: String(viatico.id_moneda ?? ""),
      monto_entregado: String(viatico.monto_entregado ?? ""),
      monto_devuelto: String(viatico.monto_devuelto ?? ""),
    })
    setDialogViaticoEdicionAbierto(true)
  }

  const abrirConfirmacionAprobacionViatico = (viatico: ViaticoDelViaje) => {
    setViaticoAprobacion(viatico)
    setDialogAprobacionViaticoAbierto(true)
  }

  const confirmarAprobacionViatico = async () => {
    if (!viaticoAprobacion) return
    await aprobarViatico(viaticoAprobacion.id_viatico)
  }

  const seleccionarEmpleado = (id: string) => {
    setEmpleadoSeleccionado(id)
    setDialogAbierto(false)
    setViajes([])
    setViajeSeleccionado(undefined)
    setComentarios([])
    setViaticos([])
    setTickets([])
    setTicketImagenes({})
  }

  const seleccionarViaje = (index: number) => {
    setComentarios([])
    setViaticos([])
    setTickets([])
    setTicketImagenes({})
    setTicketDetalle(null)
    setDialogTicketDetalleAbierto(false)
    setViajeSeleccionado(index)
  }

  const abrirDetalleTicket = (ticket: TicketDelViaje) => {
    setReciboSeleccionado(undefined)
    setTicketDetalle(null)
    setDialogTicketDetalleAbierto(true)
    void cargarDetalleTicket(ticket.id_ticket)
  }

  const cerrarDetalleTicket = (open: boolean) => {
    setDialogTicketDetalleAbierto(open)
    if (!open) {
      setTicketDetalle(null)
    }
  }

  useEffect(() => {
    if (!dialogAbierto) return
    let cancelled = false
    const cargarEmpleados = async () => {
      try {
        setLoadingEmpleados(true)
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
          setEmpleados(
            list.map(mapEmpleado).filter((empleado) => empleado.id !== "")
          )
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
        if (!cancelled) setLoadingEmpleados(false)
      }
    }
    void cargarEmpleados()
    return () => {
      cancelled = true
    }
  }, [dialogAbierto])

  useEffect(() => {
    if (!empleadoSeleccionado) return
    let cancelled = false
    const cargarViajes = async () => {
      try {
        setLoadingViajes(true)
        const response = await fetchWithConnectionCheck(
          `/api/generales/viajes/viajante?id_usuario_viajante=${encodeURIComponent(empleadoSeleccionado)}`
        )
        if (!response.ok) throw new Error("Error al obtener viajes")
        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []
        const viajesCargados = list
          .map(mapViajeDelEmpleado)
          .filter((x): x is ViajeDelEmpleado => x !== null)
        if (!cancelled) {
          setViajes(viajesCargados)
          setViajeSeleccionado(undefined)
          setComentarios([])
        }
      } catch {
        if (!cancelled) {
          setViajes([])
          setViajeSeleccionado(undefined)
          setComentarios([])
          toast.add({
            type: "error",
            description: "No se pudieron cargar los viajes del empleado",
          })
        }
      } finally {
        if (!cancelled) setLoadingViajes(false)
      }
    }
    void cargarViajes()
    return () => {
      cancelled = true
    }
  }, [empleadoSeleccionado])

  useEffect(() => {
    const info = viajes[viajeSeleccionado ?? -1]
    const idViajeUsuario = info?.id_viaje_usuario
    if (!idViajeUsuario) return
    let cancelled = false
    void (async () => {
      if (!cancelled) await cargarDetalleViaje(idViajeUsuario)
    })()
    return () => {
      cancelled = true
    }
  }, [cargarDetalleViaje, viajes, viajeSeleccionado])

  useEffect(() => {
    if (!dialogViaticoEdicionAbierto) return
    let cancelled = false
    const cargarMonedas = async () => {
      try {
        setLoadingMonedas(true)
        const response = await fetchWithConnectionCheck(
          "/api/generales/monedas/lista"
        )
        if (!response.ok) throw new Error("Error al obtener monedas")
        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []
        if (!cancelled) {
          setMonedas(
            list
              .map((item) => {
                const id = String(item.id_moneda ?? item.id ?? "").trim()
                const nombre = String(
                  item.nombre ?? item.moneda ?? item.descripcion ?? ""
                ).trim()
                if (!id && !nombre) return null
                return {
                  id: id || "0",
                  nombre: nombre || `Moneda ${id || ""}`,
                }
              })
              .filter((x): x is Moneda => x !== null)
          )
        }
      } catch {
        if (!cancelled) {
          setMonedas([])
          toast.add({
            type: "error",
            description: "No se pudieron cargar las monedas",
          })
        }
      } finally {
        if (!cancelled) setLoadingMonedas(false)
      }
    }
    void cargarMonedas()
    return () => {
      cancelled = true
    }
  }, [dialogViaticoEdicionAbierto])

  return {
    empleados,
    empleadoSeleccionado,
    empleadoSeleccionadoInfo,
    viajes,
    viajeSeleccionado,
    viajeActual,
    idViajeUsuarioActual,
    viajesTags,
    viajesSubtitles,
    reciboSeleccionado,
    setReciboSeleccionado,
    comentarios,
    viaticos,
    tickets,
    ticketDetalle,
    loadingTicketDetalle,
    ticketImagenes,
    loadingTicketImagenes,
    monedas,
    textoComentario,
    setTextoComentario,
    viaticoEditando,
    setViaticoEditando,
    filtroInput,
    setFiltroInput,

    loadingEmpleados,
    loadingViajes,
    loadingComentarios,
    loadingViaticos,
    loadingTickets,
    loadingMonedas,

    filasPagina,
    paginaActual,
    totalPaginas,
    paginaAnterior,
    paginaSiguiente,

    dialogAbierto,
    dialogComentarioAbierto,
    dialogViaticoEdicionAbierto,
    dialogAprobacionViaticoAbierto,
    viaticoAprobacion,
    dialogTicketDetalleAbierto,

    aplicarFiltro,
    limpiarFiltro,
    abrirDialogViajante,
    cerrarDialogViajante,
    abrirDialogComentario,
    cerrarDialogComentario,
    cerrarDialogEdicion,
    cerrarDialogAprobacionViatico,
    abrirEdicionViatico,
    abrirConfirmacionAprobacionViatico,
    confirmarAprobacionViatico,
    seleccionarEmpleado,
    seleccionarViaje,
    abrirDetalleTicket,
    cerrarDetalleTicket,
    cargarDetalleTicket,
    aprobarTicket,
    guardarComentario,
    guardarViaticoEditado,
    aprobarViatico,
  }
}

export type UseVerRendicionesReturn = ReturnType<typeof useVerRendiciones>
