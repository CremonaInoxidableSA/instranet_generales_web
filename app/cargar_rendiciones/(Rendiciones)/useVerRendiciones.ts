"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/components/ui/toast"
import { useUser } from "@/context/userContext"
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
  TicketEditando,
  ViaticoDelViaje,
  ViaticoEditando,
  ViajeDelEmpleado,
} from "./types"

const FILAS_POR_PAGINA = 6

export function useVerRendiciones() {
  const { id_current_user } = useUser()
  const usuarioActualId = (id_current_user ?? "").trim()

  // ------------------- STATE -------------------
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
  const [dialogTicketUploadAbierto, setDialogTicketUploadAbierto] =
    useState(false)
  const [dialogTicketDetalleAbierto, setDialogTicketDetalleAbierto] =
    useState(false)
  const [dialogTicketEdicionAbierto, setDialogTicketEdicionAbierto] =
    useState(false)

  const [textoComentario, setTextoComentario] = useState("")
  const [ticketDetalle, setTicketDetalle] = useState<TicketDetalle | null>(null)
  const [loadingTicketDetalle, setLoadingTicketDetalle] = useState(false)
  const [ticketEditando, setTicketEditando] = useState<TicketEditando | null>(
    null
  )
  const [viaticoEditando, setViaticoEditando] =
    useState<ViaticoEditando | null>(null)
  const [mediosPago, setMediosPago] = useState<Moneda[]>([])
  const [conceptos, setConceptos] = useState<Moneda[]>([])
  const [loadingCatalogosTicket, setLoadingCatalogosTicket] = useState(false)

  const [filtroInput, setFiltroInput] = useState("")
  const [filtro, setFiltro] = useState("")
  const [pagina, setPagina] = useState(0)

  // ------------------- DERIVED -------------------
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

  // ------------------- ACCIONES DE FILTRO / PAGINACIÓN -------------------
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

  // ------------------- CARGA DE DATOS -------------------
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
      if (puedeEditarTicket(ticket.estado)) {
        const siguienteTicketEditando = {
          id_ticket: ticket.id_ticket,
          nombre_imagen: ticket.nombre_imagen,
          fecha_gasto: String(ticket.fecha_gasto ?? "").includes("T")
            ? String(ticket.fecha_gasto ?? "").slice(0, 10)
            : String(ticket.fecha_gasto ?? ""),
          monto:
            ticket.monto !== null && ticket.monto !== undefined
              ? String(ticket.monto)
              : "",
          id_medio_pago: ticket.id_medio_pago
            ? String(ticket.id_medio_pago)
            : "",
          id_moneda: ticket.id_moneda ? String(ticket.id_moneda) : "",
          id_concepto: ticket.id_concepto ? String(ticket.id_concepto) : "",
        }
        setTicketEditando(siguienteTicketEditando)
        void cargarCatalogosTicket()
      } else {
        setTicketEditando(null)
      }
    } catch {
      setTicketDetalle(null)
      setTicketEditando(null)
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
          : Array.isArray(body?.items)
            ? body.items
            : Array.isArray(body?.result)
              ? body.result
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

  const eliminarTicket = useCallback(
    async (idTicket: number) => {
      if (!idTicket) return

      try {
        const response = await fetchWithConnectionCheck(
          "/api/generales/tickets/eliminar",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ id_ticket: Number(idTicket) }),
          }
        )

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(
            typeof payload?.detail === "string"
              ? payload.detail
              : "No se pudo eliminar el recibo"
          )
        }

        if (idViajeUsuarioActual) {
          await cargarDetalleViaje(String(idViajeUsuarioActual))
        }
        setReciboSeleccionado(undefined)
        setDialogTicketDetalleAbierto(false)
        setTicketDetalle(null)
        toast.add({
          type: "success",
          description:
            typeof payload?.detail === "string"
              ? payload.detail
              : "Recibo eliminado correctamente.",
        })
      } catch (error) {
        toast.add({
          type: "error",
          description:
            error instanceof Error
              ? error.message
              : "No se pudo eliminar el recibo.",
        })
      }
    },
    [cargarDetalleViaje, idViajeUsuarioActual]
  )

  // ------------------- HANDLERS: GUARDAR / APROBAR -------------------
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
        description: "No hay un viático válido para guardar.",
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
      const endpoint =
        viaticoEditando.id_viatico > 0
          ? "/api/generales/viaticos/editar"
          : "/api/generales/viaticos/crear"
      const method = viaticoEditando.id_viatico > 0 ? "PUT" : "POST"

      const body =
        viaticoEditando.id_viatico > 0
          ? {
              id_viatico: Number(viaticoEditando.id_viatico),
              id_moneda: idMoneda,
              monto_entregado: montoEntregado,
              monto_devuelto: montoDevuelto,
            }
          : {
              id_viaje_usuario: Number(idViajeUsuarioActual),
              id_moneda: idMoneda,
              monto_entregado: montoEntregado,
              monto_devuelto: montoDevuelto,
            }

      const response = await fetchWithConnectionCheck(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : viaticoEditando.id_viatico > 0
              ? "No se pudo actualizar el viático"
              : "No se pudo crear el viático"
        )
      }

      await cargarDetalleViaje(String(idViajeUsuarioActual))
      setDialogViaticoEdicionAbierto(false)
      setViaticoEditando(null)
      toast.add({
        type: "success",
        description:
          viaticoEditando.id_viatico > 0
            ? "Viático actualizado correctamente."
            : "Viático creado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description:
          viaticoEditando.id_viatico > 0
            ? "No se pudo actualizar el viático."
            : "No se pudo crear el viático.",
      })
    }
  }

  const aprobarViatico = async () => {
    if (!viaticoEditando || !idViajeUsuarioActual) {
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
            id_viatico: Number(viaticoEditando.id_viatico),
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
      setViaticoEditando(null)
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

  // ------------------- SELECCIÓN / APERTURA DE DIÁLOGOS -------------------
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

  const abrirDialogCargaTickets = () => {
    if (!idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "Seleccioná un viaje antes de subir recibos.",
      })
      return
    }
    setDialogTicketUploadAbierto(true)
  }

  const cerrarDialogComentario = (open: boolean) => {
    setDialogComentarioAbierto(open)
    if (!open) setTextoComentario("")
  }

  const cerrarDialogCargaTickets = (open: boolean) => {
    setDialogTicketUploadAbierto(open)
  }

  const cerrarDialogEdicion = (open: boolean) => {
    setDialogViaticoEdicionAbierto(open)
    if (!open) setViaticoEditando(null)
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

  const abrirCreacionViatico = () => {
    if (!idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "Seleccioná un viaje antes de crear un viático.",
      })
      return
    }

    setViaticoEditando({
      id_viatico: 0,
      id_moneda: "",
      monto_entregado: "",
      monto_devuelto: "",
    })
    setDialogViaticoEdicionAbierto(true)
  }

  const subirTickets = useCallback(
    async (archivos: File[]) => {
      if (!idViajeUsuarioActual) {
        toast.add({
          type: "error",
          description: "Seleccioná un viaje antes de subir recibos.",
        })
        return
      }

      if (!archivos.length) {
        toast.add({
          type: "error",
          description: "Seleccioná al menos una imagen para subir.",
        })
        return
      }

      try {
        const formData = new FormData()
        archivos.forEach((archivo) => {
          formData.append("archivos", archivo, archivo.name)
        })

        const response = await fetchWithConnectionCheck(
          `/api/generales/tickets/cargar?id_viaje_usuario=${encodeURIComponent(String(idViajeUsuarioActual))}`,
          {
            method: "POST",
            body: formData,
          }
        )

        const payload = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            typeof payload?.detail === "string"
              ? payload.detail
              : typeof payload?.error === "string"
                ? payload.error
                : "No se pudieron cargar los recibos"
          )
        }

        await cargarDetalleViaje(String(idViajeUsuarioActual))
        setDialogTicketUploadAbierto(false)
        toast.add({
          type: "success",
          description:
            typeof payload?.detail === "string"
              ? payload.detail
              : "Recibos cargados correctamente.",
        })
      } catch (error) {
        toast.add({
          type: "error",
          description:
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los recibos.",
        })
      }
    },
    [cargarDetalleViaje, idViajeUsuarioActual]
  )

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
    if (index < 0 || index >= viajes.length) {
      setViajeSeleccionado(undefined)
      setComentarios([])
      setViaticos([])
      setTickets([])
      setTicketImagenes({})
      setTicketDetalle(null)
      setDialogTicketDetalleAbierto(false)
      return
    }

    if (viajeSeleccionado === index) {
      return
    }

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
    setTicketEditando(null)
    setDialogTicketDetalleAbierto(true)
    void cargarDetalleTicket(ticket.id_ticket)
  }

  const cerrarDetalleTicket = (open: boolean) => {
    setDialogTicketDetalleAbierto(open)
    if (!open) {
      setTicketDetalle(null)
      setTicketEditando(null)
    }
  }

  const puedeEditarTicket = (estado?: string | null) => {
    const value = String(estado ?? "")
      .trim()
      .toUpperCase()

    return value !== "APROBADO" && value !== "APROBADA"
  }

  const abrirEdicionTicket = (ticket: TicketDetalle | null) => {
    if (!ticket || !puedeEditarTicket(ticket.estado)) {
      return
    }

    const fecha = String(ticket.fecha_gasto ?? "").trim()
    const fechaNormalizada = fecha.includes("T") ? fecha.slice(0, 10) : fecha

    setTicketEditando({
      id_ticket: ticket.id_ticket,
      nombre_imagen: ticket.nombre_imagen,
      fecha_gasto: fechaNormalizada,
      monto:
        ticket.monto !== null && ticket.monto !== undefined
          ? String(ticket.monto)
          : "",
      id_medio_pago: ticket.id_medio_pago ? String(ticket.id_medio_pago) : "",
      id_moneda: ticket.id_moneda ? String(ticket.id_moneda) : "",
      id_concepto: ticket.id_concepto ? String(ticket.id_concepto) : "",
    })
  }

  const cerrarDialogEdicionTicket = (open: boolean) => {
    setDialogTicketEdicionAbierto(open)
    if (!open) {
      setTicketEditando(null)
    }
  }

  const guardarTicketEditado = async (
    ticketAEditar: TicketEditando | null = ticketEditando,
    seguir = false
  ) => {
    const datos = ticketAEditar ?? ticketEditando
    if (!datos) {
      toast.add({
        type: "error",
        description: "No hay un recibo válido para guardar.",
      })
      return
    }

    const fecha = datos.fecha_gasto.trim()
    const nombreImagen = String(datos.nombre_imagen ?? "").trim()
    const monto = Number(datos.monto)
    const idMoneda = Number(datos.id_moneda)
    const idMedioPago = Number(datos.id_medio_pago)
    const idConcepto = Number(datos.id_concepto)

    if (
      !nombreImagen ||
      !fecha ||
      !Number.isFinite(monto) ||
      monto <= 0 ||
      !Number.isFinite(idMoneda) ||
      !Number.isFinite(idMedioPago) ||
      !Number.isFinite(idConcepto)
    ) {
      toast.add({
        type: "error",
        description: "Completá todos los campos del recibo antes de guardar.",
      })
      return
    }

    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/tickets/editar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_ticket: Number(datos.id_ticket),
            nombre_imagen: nombreImagen,
            fecha_gasto: fecha,
            monto,
            id_medio_pago: idMedioPago,
            id_moneda: idMoneda,
            id_concepto: idConcepto,
          }),
        }
      )

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload?.detail === "string"
            ? payload.detail
            : typeof payload?.error === "string"
              ? payload.error
              : "No se pudo guardar la información del recibo"
        )
      }

      if (idViajeUsuarioActual) {
        await cargarDetalleViaje(String(idViajeUsuarioActual))
      }
      setTicketDetalle((prev) =>
        prev && prev.id_ticket === datos.id_ticket
          ? {
              ...prev,
              nombre_imagen: nombreImagen,
              fecha_gasto: fecha,
              monto,
              id_medio_pago: idMedioPago,
              id_moneda: idMoneda,
              id_concepto: idConcepto,
            }
          : prev
      )
      setTicketEditando(null)
      setDialogTicketEdicionAbierto(false)

      if (seguir) {
        const indiceActual = tickets.findIndex(
          (item) => item.id_ticket === datos.id_ticket
        )
        const siguiente = tickets[indiceActual + 1]
        if (siguiente) {
          setReciboSeleccionado(indiceActual + 1)
          await cargarDetalleTicket(siguiente.id_ticket)
          toast.add({
            type: "success",
            description: "Recibo actualizado correctamente.",
          })
          return
        }
      }

      setDialogTicketDetalleAbierto(false)
      setTicketDetalle(null)
      setReciboSeleccionado(undefined)

      toast.add({
        type: "success",
        description: "Recibo actualizado correctamente.",
      })
    } catch (error) {
      toast.add({
        type: "error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la información del recibo.",
      })
    }
  }

  const guardarTicketEditadoYSiguiente = async (
    ticketAEditar: TicketEditando | null = ticketEditando
  ) => {
    await guardarTicketEditado(ticketAEditar, true)
  }

  const parseCatalogo = (body: unknown) => {
    if (Array.isArray(body)) return body
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>
      if (Array.isArray(record.data)) return record.data
      if (Array.isArray(record.items)) return record.items
      if (Array.isArray(record.result)) return record.result
      if (Array.isArray(record.tickets)) return record.tickets
    }
    return []
  }

  const cargarCatalogosTicket = useCallback(async () => {
    try {
      setLoadingCatalogosTicket(true)

      const [respuestaMonedas, respuestaMedios, respuestaConceptos] =
        await Promise.all([
          fetchWithConnectionCheck("/api/generales/monedas/lista"),
          fetchWithConnectionCheck("/api/generales/medios-pago/lista"),
          fetchWithConnectionCheck("/api/generales/conceptos/lista"),
        ])

      const [bodyMonedas, bodyMedios, bodyConceptos] = await Promise.all([
        respuestaMonedas.json().catch(() => []),
        respuestaMedios.json().catch(() => []),
        respuestaConceptos.json().catch(() => []),
      ])

      if (
        !respuestaMonedas.ok ||
        !respuestaMedios.ok ||
        !respuestaConceptos.ok
      ) {
        throw new Error("No se pudieron cargar los catálogos del recibo")
      }

      const mapCatalogo = (items: unknown[], keyId: string, keyLabel: string) =>
        items
          .map((item) => {
            const record = item as Record<string, unknown>
            const estado = record.estado
            const estadoValor =
              typeof estado === "string"
                ? estado.trim().toLowerCase()
                : String(estado ?? "")
                    .trim()
                    .toLowerCase()
            const estaActivo =
              estado === undefined ||
              estado === null ||
              estado === "" ||
              estado === true ||
              estado === 1 ||
              estadoValor === "activo" ||
              estadoValor === "true" ||
              estadoValor === "1" ||
              estadoValor === "habilitado" ||
              estadoValor === "enabled"

            if (!estaActivo) return null

            const id = String(record[keyId] ?? record.id ?? "").trim()
            const nombre = String(
              record[keyLabel] ?? record.nombre ?? record.descripcion ?? ""
            ).trim()
            if (!id && !nombre) return null
            return {
              id: id || "0",
              nombre: nombre || `Opción ${id || ""}`,
            }
          })
          .filter((item): item is Moneda => item !== null)

      const soloHabilitados = (
        items: unknown[],
        keyId: string,
        keyLabel: string
      ) => mapCatalogo(items, keyId, keyLabel)

      setMonedas(
        soloHabilitados(parseCatalogo(bodyMonedas), "id_moneda", "nombre")
      )
      setMediosPago(
        soloHabilitados(parseCatalogo(bodyMedios), "id_medio_pago", "nombre")
      )
      setConceptos(
        soloHabilitados(parseCatalogo(bodyConceptos), "id_concepto", "nombre")
      )
    } catch {
      setMonedas([])
      setMediosPago([])
      setConceptos([])
      toast.add({
        type: "error",
        description: "No se pudieron cargar los catálogos del recibo.",
      })
    } finally {
      setLoadingCatalogosTicket(false)
    }
  }, [])

  // ------------------- EFFECTS -------------------
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
    if (!usuarioActualId) return

    let cancelled = false
    const cargarViajes = async () => {
      try {
        setLoadingViajes(true)
        const response = await fetchWithConnectionCheck(
          `/api/generales/viajes/viajante?id_usuario_viajante=${encodeURIComponent(usuarioActualId)}`
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
          setEmpleadoSeleccionado(usuarioActualId)
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
            description: "No se pudieron cargar tus viajes",
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
  }, [usuarioActualId])

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
    if (!dialogViaticoEdicionAbierto && !dialogTicketEdicionAbierto) return
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
                const estado = item.estado
                const estadoTexto = String(estado ?? "")
                  .trim()
                  .toLowerCase()
                const estaActivo =
                  estado === undefined ||
                  estado === null ||
                  estado === "" ||
                  estado === true ||
                  estado === 1 ||
                  estadoTexto === "activo" ||
                  estadoTexto === "true" ||
                  estadoTexto === "1" ||
                  estadoTexto === "habilitado" ||
                  estadoTexto === "enabled"

                if (!estaActivo) return null

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
  }, [dialogTicketEdicionAbierto, dialogViaticoEdicionAbierto])

  useEffect(() => {
    if (!dialogTicketEdicionAbierto) return
    let cancelled = false

    const cargarDatosTicket = async () => {
      if (cancelled) return
      await cargarCatalogosTicket()
    }

    void cargarDatosTicket()
    return () => {
      cancelled = true
    }
  }, [cargarCatalogosTicket, dialogTicketEdicionAbierto])

  // ------------------- API PÚBLICA DEL HOOK -------------------
  return {
    // state
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
    ticketEditando,
    setTicketEditando,
    ticketImagenes,
    loadingTicketImagenes,
    monedas,
    mediosPago,
    conceptos,
    loadingCatalogosTicket,
    textoComentario,
    setTextoComentario,
    viaticoEditando,
    setViaticoEditando,
    filtroInput,
    setFiltroInput,

    // loading
    loadingEmpleados,
    loadingViajes,
    loadingComentarios,
    loadingViaticos,
    loadingTickets,
    loadingMonedas,

    // paginación
    filasPagina,
    paginaActual,
    totalPaginas,
    paginaAnterior,
    paginaSiguiente,

    // dialogs open state
    dialogAbierto,
    dialogComentarioAbierto,
    dialogViaticoEdicionAbierto,
    dialogTicketUploadAbierto,
    dialogTicketDetalleAbierto,
    dialogTicketEdicionAbierto,

    // actions
    aplicarFiltro,
    limpiarFiltro,
    abrirDialogViajante,
    cerrarDialogViajante,
    abrirDialogComentario,
    abrirDialogCargaTickets,
    cerrarDialogComentario,
    cerrarDialogCargaTickets,
    cerrarDialogEdicion,
    abrirEdicionViatico,
    abrirCreacionViatico,
    subirTickets,
    seleccionarEmpleado,
    seleccionarViaje,
    abrirDetalleTicket,
    cerrarDetalleTicket,
    abrirEdicionTicket,
    cerrarDialogEdicionTicket,
    guardarTicketEditado,
    guardarTicketEditadoYSiguiente,
    cargarDetalleTicket,
    aprobarTicket,
    eliminarTicket,
    guardarComentario,
    guardarViaticoEditado,
    aprobarViatico,
    puedeEditarTicket,
  }
}

export type UseVerRendicionesReturn = ReturnType<typeof useVerRendiciones>
