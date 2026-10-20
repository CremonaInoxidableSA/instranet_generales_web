"use client"

import { useEffect, useMemo, useState } from "react"
import { Boton, TextScrollArea } from "@/components/components"
import type { Comentario, Viatico } from "@/types/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import { toast } from "@/components/ui/toast"

type Empleado = {
  id: string
  nombre: string
  apellido: string
  legajo: string
}

type ViajeDelEmpleado = {
  id_viaje: string
  id_viaje_usuario?: string
  nombre_viaje: string
}

type ComentarioDelViaje = Pick<
  Comentario,
  | "nombre_usuario_creador"
  | "apellido_usuario_creador"
  | "comentario"
  | "fecha_creacion"
>

type ViaticoDelViaje = Pick<
  Viatico,
  "id_viatico" | "monto_entregado" | "monto_devuelto"
> & {
  moneda: string
  estado: boolean
}

const mapEmpleado = (item: Record<string, unknown>): Empleado => ({
  id: String(item.id_usuario ?? item.id ?? "").trim(),
  nombre: String(item.nombre ?? ""),
  apellido: String(item.apellido ?? ""),
  legajo:
    item.legajo === null || item.legajo === undefined
      ? ""
      : String(item.legajo),
})

const mapViajeDelEmpleado = (
  item: Record<string, unknown>
): ViajeDelEmpleado | null => {
  const idViaje = item.id_viaje ?? item.id_viaje_usuario ?? item.id ?? ""
  const idViajeUsuario = item.id_viaje_usuario ?? item.id ?? ""
  const nombreViaje = String(item.nombre_viaje ?? item.nombre ?? "").trim()

  if (!idViaje && !nombreViaje) return null

  return {
    id_viaje: String(idViaje),
    id_viaje_usuario: String(idViajeUsuario),
    nombre_viaje: nombreViaje || `Viaje ${String(idViaje)}`,
  }
}

const mapComentarioDelViaje = (
  item: Record<string, unknown>
): ComentarioDelViaje | null => {
  const comentario = String(item.comentario ?? "").trim()
  const nombre = String(item.nombre_usuario_creador ?? "").trim()
  const apellido = String(item.apellido_usuario_creador ?? "").trim()
  const fechaCreacion = String(item.fecha_creacion ?? "").trim()

  if (!comentario && !nombre && !apellido && !fechaCreacion) {
    return null
  }

  return {
    nombre_usuario_creador: nombre,
    apellido_usuario_creador: apellido,
    comentario: comentario || "Sin comentario",
    fecha_creacion: fechaCreacion,
  }
}

const mapViaticoDelViaje = (
  item: Record<string, unknown>
): ViaticoDelViaje | null => {
  const idViatico = item.id_viatico ?? item.id ?? ""
  const moneda = String(item.moneda ?? "").trim() || "Sin moneda"
  const montoEntregado =
    item.monto_entregado === null || item.monto_entregado === undefined
      ? 0
      : Number(item.monto_entregado)
  const montoDevuelto =
    item.monto_devuelto === null || item.monto_devuelto === undefined
      ? 0
      : Number(item.monto_devuelto)
  const estado = Boolean(item.estado)

  if (!idViatico && !moneda && !montoEntregado && !montoDevuelto) {
    return null
  }

  return {
    id_viatico: Number(idViatico) || 0,
    moneda,
    monto_entregado: montoEntregado,
    monto_devuelto: montoDevuelto,
    estado,
  }
}

const FILAS_POR_PAGINA = 6

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export default function VerRendiciones() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [viajes, setViajes] = useState<ViajeDelEmpleado[]>([])
  const [viajeSeleccionado, setViajeSeleccionado] = useState<number>()
  const [reciboSeleccionado, setReciboSeleccionado] = useState<number>()
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [loadingViajes, setLoadingViajes] = useState(false)
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [loadingViaticos, setLoadingViaticos] = useState(false)
  const [comentarios, setComentarios] = useState<ComentarioDelViaje[]>([])
  const [viaticos, setViaticos] = useState<ViaticoDelViaje[]>([])
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [dialogViaticoAbierto, setDialogViaticoAbierto] = useState(false)
  const [dialogComentarioAbierto, setDialogComentarioAbierto] = useState(false)
  const [textoComentario, setTextoComentario] = useState("")
  const [nuevoViatico, setNuevoViatico] = useState({
    id_moneda: "",
    monto_entregado: "",
    monto_devuelto: "",
  })
  const [filtroInput, setFiltroInput] = useState("")
  const [filtro, setFiltro] = useState("")
  const [pagina, setPagina] = useState(0)

  const empleadosFiltrados = useMemo(() => {
    const textoBusqueda = normalizar(filtro.trim())

    if (!textoBusqueda) {
      return empleados
    }

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

  const aplicarFiltro = () => {
    setPagina(0)
    setFiltro(filtroInput)
  }

  const limpiarFiltro = () => {
    setFiltroInput("")
    setFiltro("")
    setPagina(0)
  }

  const viajeActual = viajes[viajeSeleccionado ?? -1] ?? null
  const idViajeUsuarioActual = viajeActual?.id_viaje_usuario

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
          headers: {
            "Content-Type": "application/json",
          },
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

      setComentarios((actual) => [
        {
          nombre_usuario_creador: "",
          apellido_usuario_creador: "",
          comentario,
          fecha_creacion: new Date().toISOString(),
        },
        ...actual,
      ])
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

  const guardarViatico = async () => {
    if (!idViajeUsuarioActual) {
      toast.add({
        type: "error",
        description: "Seleccioná un viaje antes de agregar el viático.",
      })
      return
    }

    const idMoneda = Number(nuevoViatico.id_moneda)
    const montoEntregado = Number(nuevoViatico.monto_entregado || 0)
    const montoDevuelto = Number(nuevoViatico.monto_devuelto || 0)

    if (!idMoneda || !Number.isFinite(idMoneda)) {
      toast.add({
        type: "error",
        description: "Seleccioná una moneda válida.",
      })
      return
    }

    try {
      const response = await fetchWithConnectionCheck(
        "/api/generales/viaticos/crear",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_viaje_usuario: Number(idViajeUsuarioActual),
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
            : "No se pudo crear el viático"
        )
      }

      const monedaLabel = nuevoViatico.id_moneda
      setViaticos((actual) => [
        {
          id_viatico: Date.now(),
          moneda: monedaLabel,
          monto_entregado: montoEntregado,
          monto_devuelto: montoDevuelto,
          estado: false,
        },
        ...actual,
      ])
      setNuevoViatico({
        id_moneda: "",
        monto_entregado: "",
        monto_devuelto: "",
      })
      setDialogViaticoAbierto(false)
      toast.add({
        type: "success",
        description: "Viático agregado correctamente.",
      })
    } catch {
      toast.add({
        type: "error",
        description: "No se pudo guardar el viático.",
      })
    }
  }

  useEffect(() => {
    if (!dialogAbierto) {
      return
    }

    let cancelled = false

    const cargarEmpleados = async () => {
      try {
        setLoadingEmpleados(true)
        const response = await fetchWithConnectionCheck(
          "/api/auth/lista-empleados"
        )

        if (!response.ok) {
          throw new Error("Error al obtener empleados")
        }

        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []

        if (!cancelled) {
          setEmpleados(
            list
              .map((item) => mapEmpleado(item))
              .filter((empleado) => empleado.id !== "")
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
        if (!cancelled) {
          setLoadingEmpleados(false)
        }
      }
    }

    void cargarEmpleados()

    return () => {
      cancelled = true
    }
  }, [dialogAbierto])

  useEffect(() => {
    if (!empleadoSeleccionado) {
      return
    }

    let cancelled = false

    const cargarViajes = async () => {
      try {
        setLoadingViajes(true)
        const response = await fetchWithConnectionCheck(
          `/api/generales/viajes/viajante?id_usuario_viajante=${encodeURIComponent(empleadoSeleccionado)}`
        )

        if (!response.ok) {
          throw new Error("Error al obtener viajes")
        }

        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []

        const viajesCargados = list
          .map((item) => mapViajeDelEmpleado(item))
          .filter((item): item is ViajeDelEmpleado => item !== null)

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
        if (!cancelled) {
          setLoadingViajes(false)
        }
      }
    }

    void cargarViajes()

    return () => {
      cancelled = true
    }
  }, [empleadoSeleccionado])

  useEffect(() => {
    const viajeSeleccionadoInfo = viajes[viajeSeleccionado ?? -1]
    const idViajeUsuario = viajeSeleccionadoInfo?.id_viaje_usuario

    if (!idViajeUsuario) {
      return
    }

    let cancelled = false

    const cargarComentarios = async () => {
      try {
        setLoadingComentarios(true)
        const response = await fetchWithConnectionCheck(
          `/api/generales/comentarios/lista?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`
        )

        if (!response.ok) {
          throw new Error("Error al obtener comentarios")
        }

        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []

        if (!cancelled) {
          setComentarios(
            list
              .map((item) => mapComentarioDelViaje(item))
              .filter((item): item is ComentarioDelViaje => item !== null)
          )
        }
      } catch {
        if (!cancelled) {
          setComentarios([])
          toast.add({
            type: "error",
            description: "No se pudieron cargar los comentarios del viaje",
          })
        }
      } finally {
        if (!cancelled) {
          setLoadingComentarios(false)
        }
      }
    }

    const cargarViaticos = async () => {
      try {
        setLoadingViaticos(true)
        const response = await fetchWithConnectionCheck(
          `/api/generales/viaticos/lista?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`
        )

        if (!response.ok) {
          throw new Error("Error al obtener viaticos")
        }

        const body = await response.json()
        const list: Record<string, unknown>[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : []

        if (!cancelled) {
          setViaticos(
            list
              .map((item) => mapViaticoDelViaje(item))
              .filter((item): item is ViaticoDelViaje => item !== null)
          )
        }
      } catch {
        if (!cancelled) {
          setViaticos([])
          toast.add({
            type: "error",
            description: "No se pudieron cargar los viáticos del viaje",
          })
        }
      } finally {
        if (!cancelled) {
          setLoadingViaticos(false)
        }
      }
    }

    void cargarComentarios()
    void cargarViaticos()

    return () => {
      cancelled = true
    }
  }, [viajes, viajeSeleccionado])

  const empleadoSeleccionadoInfo = useMemo(
    () =>
      empleados.find((empleado) => empleado.id === empleadoSeleccionado) ??
      null,
    [empleados, empleadoSeleccionado]
  )

  const viajesTags = viajes.map((viaje) => viaje.nombre_viaje)
  const viajesSubtitles = viajes.map((viaje) => `ID: ${viaje.id_viaje}`)

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      <div className="flex flex-1 flex-col gap-3 rounded">
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <div className="flex flex-col justify-between">
            <div className="flex flex-1 flex-row gap-3">
              <h1 className="w-full font-semibold">SELECCIONE EL VIAJE</h1>
              <Button
                type="button"
                onClick={() => {
                  setFiltroInput("")
                  setFiltro("")
                  setPagina(0)
                  setDialogAbierto(true)
                }}
                disabled={loadingEmpleados}
                className="rounded border-2 border-bluecremona bg-bluecremona/20 text-sm text-bluecremona hover:bg-bluecremona/30"
              >
                <span>
                  {loadingEmpleados
                    ? "Cargando empleados..."
                    : empleadoSeleccionadoInfo
                      ? `${empleadoSeleccionadoInfo.nombre} ${empleadoSeleccionadoInfo.apellido}`.trim()
                      : "Seleccionar viajante"}
                </span>
              </Button>
            </div>
            {empleadoSeleccionadoInfo && (
              <p className="text-xs opacity-70">
                Viajante seleccionado: {empleadoSeleccionadoInfo.legajo}
                {empleadoSeleccionadoInfo.legajo ? " · " : ""}
                {empleadoSeleccionadoInfo.nombre}{" "}
                {empleadoSeleccionadoInfo.apellido}
              </p>
            )}
          </div>

          {loadingViajes ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando viajes...
            </div>
          ) : (
            <TextScrollArea
              tags={viajesTags}
              subtitles={viajesSubtitles}
              selectedIndex={viajeSeleccionado}
              onTagClick={(_tag, index) => {
                setComentarios([])
                setViaticos([])
                setViajeSeleccionado(index)
              }}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <div className="flex flex-row items-center justify-between gap-3">
            <h1 className="font-semibold">EFECTIVO ENTREGADO POR TESORERIA</h1>
            <Boton
              extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
              placeholder="AGREGAR EFECTIVO"
              disabled={!idViajeUsuarioActual}
              onClick={() => {
                if (!idViajeUsuarioActual) return
                setDialogViaticoAbierto(true)
              }}
            />
          </div>
          {loadingViaticos ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando efectivo...
            </div>
          ) : (
            <TextScrollArea
              tags={viaticos.map((viatico) => {
                const montoEntregado = Number(viatico.monto_entregado ?? 0)
                const montoDevuelto = Number(viatico.monto_devuelto ?? 0)
                return `${viatico.moneda}: $${montoEntregado.toLocaleString("es-AR")} / Devuelto: $${montoDevuelto.toLocaleString("es-AR")}`
              })}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-2 flex-col gap-3 rounded bg-background2 p-5">
          <h1 className="font-semibold">
            {empleadoSeleccionadoInfo
              ? `${empleadoSeleccionadoInfo.nombre} ${empleadoSeleccionadoInfo.apellido}`.trim()
              : "SIN VIAJANTE"}
            {" | "}
            {viajes[viajeSeleccionado ?? -1]?.nombre_viaje ?? "SIN VIAJE"}
          </h1>
          <div className="flex flex-row gap-2">
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO USD</p>
              <p className="text-sm opacity-50">U$D 631,14</p>
            </div>
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO ARS</p>
              <p className="text-sm opacity-50">AR$ 325.800</p>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO EUR</p>
              <p className="text-sm opacity-50">€UR 325.14</p>
            </div>
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO LOCAL</p>
              <p className="text-sm opacity-50">$ 325.14</p>
            </div>
          </div>

          <TextScrollArea
            placeholder="RECIBOS"
            tags={[]}
            selectedIndex={reciboSeleccionado}
            onTagClick={(_tag, index) => setReciboSeleccionado(index)}
            extraClass="flex-1 min-h-0"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <div className="flex flex-row items-center justify-between gap-3">
            <h1 className="font-semibold">COMENTARIOS</h1>
            <Boton
              extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
              placeholder="AGREGAR COMENTARIO"
              disabled={!idViajeUsuarioActual}
              onClick={() => {
                if (!idViajeUsuarioActual) return
                setDialogComentarioAbierto(true)
              }}
            />
          </div>
          {loadingComentarios ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando comentarios...
            </div>
          ) : (
            <TextScrollArea
              tags={comentarios.map(
                (comentario) => comentario.comentario || "Sin comentario"
              )}
              subtitles={comentarios.map((comentario) => {
                const autor =
                  `${comentario.nombre_usuario_creador} ${comentario.apellido_usuario_creador}`.trim()
                const fecha = comentario.fecha_creacion
                  ? new Date(comentario.fecha_creacion).toLocaleString(
                      "es-AR",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )
                  : "Sin fecha"

                return `${autor || "Usuario"} · ${fecha}`
              })}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>
      </div>

      <Dialog
        open={dialogViaticoAbierto}
        onOpenChange={(nextOpen) => {
          setDialogViaticoAbierto(nextOpen)
          if (!nextOpen) {
            setNuevoViatico({
              id_moneda: "",
              monto_entregado: "",
              monto_devuelto: "",
            })
          }
        }}
      >
        <DialogContent className="z-100 bg-background2 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar viático</DialogTitle>
            <DialogDescription>
              Ingresá el monto entregado y la moneda para este viaje.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">ID de moneda</label>
              <Input
                type="number"
                value={nuevoViatico.id_moneda}
                onChange={(event) =>
                  setNuevoViatico((actual) => ({
                    ...actual,
                    id_moneda: event.target.value,
                  }))
                }
                className="border border-background6 bg-background3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto entregado</label>
                <Input
                  type="number"
                  value={nuevoViatico.monto_entregado}
                  onChange={(event) =>
                    setNuevoViatico((actual) => ({
                      ...actual,
                      monto_entregado: event.target.value,
                    }))
                  }
                  className="border border-background6 bg-background3"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto devuelto</label>
                <Input
                  type="number"
                  value={nuevoViatico.monto_devuelto}
                  onChange={(event) =>
                    setNuevoViatico((actual) => ({
                      ...actual,
                      monto_devuelto: event.target.value,
                    }))
                  }
                  className="border border-background6 bg-background3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogViaticoAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={guardarViatico}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogComentarioAbierto}
        onOpenChange={(nextOpen) => {
          setDialogComentarioAbierto(nextOpen)
          if (!nextOpen) {
            setTextoComentario("")
          }
        }}
      >
        <DialogContent className="z-100 bg-background2 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar comentario</DialogTitle>
            <DialogDescription>
              Escribí el comentario para el viaje seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <textarea
              value={textoComentario}
              onChange={(event) => setTextoComentario(event.target.value)}
              rows={5}
              placeholder="Escribí el comentario..."
              className="min-h-28 w-full rounded-md border border-background6 bg-background3 px-3 py-2 text-sm outline-none focus:border-bluecremona"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogComentarioAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={guardarComentario}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogAbierto}
        onOpenChange={(nextOpen) => {
          setDialogAbierto(nextOpen)

          if (!nextOpen) {
            setFiltroInput("")
            setFiltro("")
            setPagina(0)
          }
        }}
      >
        <DialogContent className="z-100 bg-background2 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar viajante</DialogTitle>
            <DialogDescription>
              Elija el viajante para cargar sus viajes asociados.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                value={filtroInput}
                onChange={(event) => setFiltroInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") aplicarFiltro()
                }}
                placeholder="Buscar por nombre, apellido o legajo"
                className="border border-background6 bg-background3"
              />
              <Button
                type="button"
                onClick={aplicarFiltro}
                className="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
              >
                Filtrar
              </Button>
              <Button
                type="button"
                onClick={limpiarFiltro}
                className="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
              >
                Limpiar
              </Button>
            </div>

            <div className="overflow-hidden rounded border border-background6">
              <Table>
                <TableHeader className="bg-background2">
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Legajo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmpleados ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 bg-background3 text-center"
                      >
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filasPagina.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 bg-background3 text-center"
                      >
                        No se encontraron empleados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filasPagina.map((empleado) => {
                      const seleccionado = empleado.id === empleadoSeleccionado

                      return (
                        <TableRow
                          key={empleado.id}
                          className={seleccionado ? "bg-bluecremona/5" : ""}
                        >
                          <TableCell className="w-10">
                            <Checkbox
                              checked={seleccionado}
                              onCheckedChange={() => {
                                setEmpleadoSeleccionado(empleado.id)
                                setDialogAbierto(false)
                                setViajes([])
                                setViajeSeleccionado(undefined)
                              }}
                            />
                          </TableCell>
                          <TableCell>{empleado.nombre}</TableCell>
                          <TableCell>{empleado.apellido}</TableCell>
                          <TableCell>{empleado.legajo || "-"}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs opacity-70">
                Página {paginaActual + 1} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPagina((actual) => Math.max(actual - 1, 0))}
                  disabled={paginaActual === 0}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPagina((actual) =>
                      Math.min(actual + 1, totalPaginas - 1)
                    )
                  }
                  disabled={paginaActual >= totalPaginas - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogAbierto(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
