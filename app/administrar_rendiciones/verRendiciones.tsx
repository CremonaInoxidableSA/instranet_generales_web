"use client"

import { useEffect, useMemo, useState } from "react"
import { Boton, TextScrollArea } from "@/components/components"
import type { Comentario } from "@/types/types"
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
  "nombre_usuario_creador" | "apellido_usuario_creador" | "comentario" | "fecha_creacion"
>

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
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<number>()
  const [reciboSeleccionado, setReciboSeleccionado] = useState<number>()
  const [efectivoEntregadoSeleccionado, setEfectivoEntregadoSeleccionado] =
    useState<number>()
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [loadingViajes, setLoadingViajes] = useState(false)
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [comentarios, setComentarios] = useState<ComentarioDelViaje[]>([])
  const [dialogAbierto, setDialogAbierto] = useState(false)
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

    void cargarComentarios()

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
              onClick={undefined}
            />
          </div>
          <TextScrollArea
            tags={[]}
            selectedIndex={efectivoEntregadoSeleccionado}
            onTagClick={(_tag, index) =>
              setEfectivoEntregadoSeleccionado(index)
            }
            extraClass="flex-1 min-h-0"
          />
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
              onClick={undefined}
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
                const autor = `${comentario.nombre_usuario_creador} ${comentario.apellido_usuario_creador}`.trim()
                const fecha = comentario.fecha_creacion
                  ? new Date(comentario.fecha_creacion).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Sin fecha"

                return `${autor || "Usuario"} · ${fecha}`
              })}
              selectedIndex={comentarioSeleccionado}
              onTagClick={(_tag, index) => setComentarioSeleccionado(index)}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>
      </div>

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
