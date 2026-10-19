"use client"

import { useEffect, useMemo, useState } from "react"
import {
  SelectorConBusqueda,
  Boton,
  TextScrollArea,
} from "@/components/components"
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
  nombre_viaje: string
}

const mapEmpleado = (item: Record<string, unknown>): Empleado => ({
  id: String(item.id_usuario ?? item.id ?? "").trim(),
  nombre: String(item.nombre ?? ""),
  apellido: String(item.apellido ?? ""),
  legajo: item.legajo === null || item.legajo === undefined ? "" : String(item.legajo),
})

const mapViajeDelEmpleado = (
  item: Record<string, unknown>
): ViajeDelEmpleado | null => {
  const idViaje = item.id_viaje ?? item.id_viaje_usuario ?? item.id ?? ""
  const nombreViaje = String(item.nombre_viaje ?? item.nombre ?? "").trim()

  if (!idViaje && !nombreViaje) return null

  return {
    id_viaje: String(idViaje),
    nombre_viaje: nombreViaje || `Viaje ${String(idViaje)}`,
  }
}

export default function VerRendiciones() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [viajes, setViajes] = useState<ViajeDelEmpleado[]>([])
  const [viajeSeleccionado, setViajeSeleccionado] = useState<number>()
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<number>()
  const [reciboSeleccionado, setReciboSeleccionado] = useState<number>()
  const [efectivoEntregadoSeleccionado, setEfectivoEntregadoSeleccionado] =
    useState<number>()
  const [loadingEmpleados, setLoadingEmpleados] = useState(true)
  const [loadingViajes, setLoadingViajes] = useState(false)

  useEffect(() => {
    let cancelled = false

    const cargarEmpleados = async () => {
      try {
        const response = await fetchWithConnectionCheck("/api/auth/lista-empleados")

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
  }, [])

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
        }
      } catch {
        if (!cancelled) {
          setViajes([])
          setViajeSeleccionado(undefined)
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

  const empleadoSelectorData = useMemo(
    () =>
      empleados.map((empleado) => ({
        id: empleado.id,
        nombre:
          [empleado.nombre, empleado.apellido].filter(Boolean).join(" ").trim() ||
          empleado.legajo ||
          "Sin nombre",
      })),
    [empleados]
  )

  const empleadoSeleccionadoInfo = useMemo(
    () =>
      empleados.find((empleado) => empleado.id === empleadoSeleccionado) ?? null,
    [empleados, empleadoSeleccionado]
  )

  const viajesTags = viajes.map((viaje) => viaje.nombre_viaje)
  const viajesSubtitles = viajes.map((viaje) => `ID: ${viaje.id_viaje}`)

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      <div className="flex flex-1 flex-col gap-3 rounded">
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <h1 className="w-full font-semibold">SELECCIONE EL VIAJE</h1>
          <SelectorConBusqueda
            extraClass="w-full"
            placeholder={loadingEmpleados ? "Cargando empleados..." : "Seleccionar viajante"}
            searchPlaceholder="Buscar viajante..."
            data={empleadoSelectorData}
            keyId="id"
            keyLabel="nombre"
            value={empleadoSeleccionado}
            onValueChange={(nextValue) => {
              setEmpleadoSeleccionado(nextValue)
              if (!nextValue) {
                setViajes([])
                setViajeSeleccionado(undefined)
              }
            }}
            disabled={loadingEmpleados}
          />

          {loadingViajes ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando viajes...
            </div>
          ) : (
            <TextScrollArea
              tags={viajesTags}
              subtitles={viajesSubtitles}
              selectedIndex={viajeSeleccionado}
              onTagClick={(_tag, index) => setViajeSeleccionado(index)}
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
          <TextScrollArea
            tags={[]}
            selectedIndex={comentarioSeleccionado}
            onTagClick={(_tag, index) => setComentarioSeleccionado(index)}
            extraClass="flex-1 min-h-0"
          />
        </div>
      </div>
    </div>
  )
}
