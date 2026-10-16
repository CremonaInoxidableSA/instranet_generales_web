import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CircleMinus, CirclePlus, Pencil } from "lucide-react"
import { toast } from "@/components/ui/toast"
import {
  Boton,
  BotonIcono,
  SelectorConBusqueda,
  TextScrollArea,
} from "@/components/components"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  useConceptos,
  useMediosPago,
  useMonedas,
  useViajes,
} from "@/context/dataGeneralContext"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import type { Viaje } from "@/types/types"

type ToggleListItem = {
  id: number
  nombre?: string
  estado?: boolean
}

type CreateEntityType = "moneda" | "viaje" | "medioPago" | "concepto"

const mapViajante = (item: Record<string, unknown>): Viajante => ({
  id_usuario_viajante: String(item.id_usuario_viajante ?? item.id ?? "").trim(),
  nombre_usuario_viajante: String(item.nombre_usuario_viajante ?? ""),
  apellido_usuario_viajante: String(item.apellido_usuario_viajante ?? ""),
  legajo_usuario_viajante: String(item.legajo_usuario_viajante ?? ""),
})

const mapViajantesFromSource = (source: unknown): Viajante[] => {
  const raw = Array.isArray(source)
    ? source
    : source && typeof source === "object"
      ? ((source as Record<string, unknown>).viajantes ?? [])
      : []

  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (item && typeof item === "object") {
        return mapViajante(item as Record<string, unknown>)
      }

      return null
    })
    .filter((item): item is Viajante => !!item && item.id_usuario_viajante !== "")
}

function SectionCard({
  title,
  buttonLabel,
  onClick,
  children,
}: {
  title: string
  buttonLabel?: string
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded bg-background2 p-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-semibold">{title}</h1>
        {buttonLabel && (
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder={buttonLabel}
            onClick={onClick}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  )
}

function ToggleListCard({
  title,
  buttonLabel,
  items,
  onToggle,
  onAdd,
  onEdit,
  actionMode = "toggle",
  emptyLabel = "Sin datos",
}: {
  title: string
  buttonLabel: string
  items: ToggleListItem[]
  onToggle: (item: ToggleListItem) => Promise<void> | void
  onAdd?: () => void
  onEdit?: (item: ToggleListItem) => Promise<void> | void
  actionMode?: "toggle" | "edit"
  emptyLabel?: string
}) {
  const [showDisabled, setShowDisabled] = useState(false)

  const enabledList = useMemo(
    () => items.filter((item) => item.estado !== false),
    [items]
  )

  const disabledList = useMemo(
    () => items.filter((item) => item.estado === false),
    [items]
  )

  const visibleList = showDisabled ? disabledList : enabledList

  return (
    <SectionCard title={title} buttonLabel={buttonLabel} onClick={onAdd}>
      <label className="flex items-center gap-2 text-sm opacity-90">
        <Checkbox
          checked={showDisabled}
          onCheckedChange={() => setShowDisabled((value) => !value)}
        />
        Mostrar deshabilitadas
      </label>
      <TextScrollArea
        tags={
          visibleList.length > 0
            ? visibleList.map((item) => item.nombre ?? String(item.id))
            : [emptyLabel]
        }
        extraClass="flex-1 min-h-0"
        withPointer={false}
        renderItem={({ tag, index }) => {
          if (visibleList.length === 0) {
            return <span className="truncate">{tag}</span>
          }

          const item = visibleList[index]
          if (!item) return null

          const isEditAction = actionMode === "edit"
          const Icono = isEditAction
            ? Pencil
            : item.estado
              ? CircleMinus
              : CirclePlus

          return (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate py-1">{tag}</span>
              <BotonIcono
                icono={Icono}
                iconClass={
                  isEditAction
                    ? "h-4 w-4 text-bluecremona"
                    : item.estado
                      ? "h-4 w-4 text-redcremona"
                      : "h-4 w-4 text-greencremona"
                }
                onClick={async () => {
                  if (isEditAction) {
                    if (onEdit) await onEdit(item)
                    return
                  }
                  await onToggle(item)
                }}
                ariaLabel={
                  isEditAction
                    ? "Editar elemento"
                    : item.estado
                      ? "Deshabilitar elemento"
                      : "Habilitar elemento"
                }
                title={
                  isEditAction
                    ? "Editar"
                    : item.estado
                      ? "Deshabilitar"
                      : "Habilitar"
                }
              />
            </div>
          )
        }}
      />
    </SectionCard>
  )
}

function CreateEntityDialog({
  open,
  entity,
  monedas,
  onClose,
  onSubmit,
}: {
  open: boolean
  entity: CreateEntityType | null
  monedas: { id: number; nombre?: string }[]
  onClose: () => void
  onSubmit: (payload: {
    nombre: string
    id_moneda?: number
  }) => Promise<void> | void
}) {
  const [nombre, setNombre] = useState("")
  const [selectedMonedaId, setSelectedMonedaId] = useState("")

  if (!entity) return null

  const isViaje = entity === "viaje"
  const titleMap: Record<CreateEntityType, string> = {
    moneda: "Agregar moneda",
    viaje: "Agregar viaje",
    medioPago: "Agregar medio de pago",
    concepto: "Agregar motivo",
  }

  const label = isViaje ? "Moneda predeterminada" : "Nombre"
  const canSubmit =
    nombre.trim().length > 0 && (!isViaje || selectedMonedaId !== "")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setNombre("")
          setSelectedMonedaId("")
          return
        }

        onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titleMap[entity]}</DialogTitle>
          <DialogDescription>
            Complete los datos para crear este elemento.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <label className="flex flex-col gap-1 text-sm text-foreground">
            <span>Nombre</span>
            <Input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder={
                entity === "moneda"
                  ? "Ej: USD"
                  : entity === "viaje"
                    ? "Ej: FRANKFURT OCTUBRE 2025"
                    : entity === "medioPago"
                      ? "Ej: Efectivo"
                      : "Ej: Viático"
              }
            />
          </label>

          {isViaje && (
            <div className="flex flex-col gap-1 text-sm text-foreground">
              <span>{label}</span>
              <SelectorConBusqueda
                placeholder="Seleccionar moneda"
                searchPlaceholder="Buscar moneda..."
                data={monedas.map((moneda) => ({
                  id: String(moneda.id),
                  nombre: moneda.nombre ?? `Moneda ${moneda.id}`,
                }))}
                value={selectedMonedaId}
                onValueChange={(value) => setSelectedMonedaId(value)}
                extraClass="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              await onSubmit({
                nombre: nombre.trim(),
                ...(isViaje ? { id_moneda: Number(selectedMonedaId) } : {}),
              })
              onClose()
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type Viajante = {
  id_usuario_viajante: string
  nombre_usuario_viajante: string
  apellido_usuario_viajante: string
  legajo_usuario_viajante: string
}

type EmpleadoRow = {
  id: string
  nombre: string
  apellido: string
  legajo: string
}

const FILAS_POR_PAGINA = 6

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const toEmpleadoRow = (e: Record<string, unknown>): EmpleadoRow => ({
  id: String(e.id_usuario ?? e.id ?? ""),
  nombre: String(e.nombre ?? ""),
  apellido: String(e.apellido ?? ""),
  legajo: e.legajo === null || e.legajo === undefined ? "" : String(e.legajo),
})

function SeleccionarViajantes({
  initialSelected,
  onSave,
  onClose,
}: {
  initialSelected: Viajante[]
  onSave: (seleccionados: Viajante[]) => void
  onClose: () => void
}) {
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

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Seleccionar viajantes</DialogTitle>
        <DialogDescription>
          Marque los empleados que viajan. La selección se mantiene aunque
          cambie de página o filtre.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={filtroInput}
            onChange={(e) => setFiltroInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") aplicarFiltro()
            }}
            placeholder="Filtrar por nombre, apellido o legajo"
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

        <div className="overflow-hidden rounded border">
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
              {loading ? (
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
                    No hay empleados disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filasPagina.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer odd:bg-background3 even:bg-background4 hover:bg-background5"
                    onClick={() => toggle(row)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={seleccion.has(row.id)}
                        onCheckedChange={() => toggle(row)}
                      />
                    </TableCell>
                    <TableCell>{row.nombre}</TableCell>
                    <TableCell>{row.apellido}</TableCell>
                    <TableCell>{row.legajo || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-60">
            {seleccion.size} viajante(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={paginaActual <= 0}
              onClick={() => setPagina(paginaActual - 1)}
            >
              Anterior
            </Button>
            <span className="min-w-20 text-center text-sm">
              Página {paginaActual + 1} de {totalPaginas}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={paginaActual >= totalPaginas - 1}
              onClick={() => setPagina(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={() => {
            onSave(Array.from(seleccion.values()))
            onClose()
          }}
        >
          Guardar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function EditViajeDialog({
  open,
  viaje,
  monedas,
  onClose,
  onSubmit,
  onLoadDetalle,
}: {
  open: boolean
  viaje: Viaje | null
  monedas: { id_moneda: number; nombre?: string }[]
  onClose: () => void
  onSubmit: (payload: {
    id_viaje: number
    id_moneda: number
    viajantes: Viajante[]
  }) => Promise<void> | void
  onLoadDetalle?: (id_viaje: number) => Promise<Record<string, unknown> | null>
}) {
  const [viajantes, setViajantes] = useState<Viajante[]>(() =>
    mapViajantesFromSource(viaje?.viajantes)
  )
  const [selectedMonedaId, setSelectedMonedaId] = useState(() =>
    viaje ? String(viaje.id_moneda ?? "") : ""
  )
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    if (!open || !viaje) return

    let cancelled = false

    const syncViaje = async () => {
      const nextViajantes = mapViajantesFromSource(viaje.viajantes)
      const nextMoneda = viaje.id_moneda != null ? String(viaje.id_moneda) : ""

      if (!cancelled) {
        setViajantes(nextViajantes)
        setSelectedMonedaId(nextMoneda)
      }

      if (!onLoadDetalle) return

      const detalle = await onLoadDetalle(viaje.id_viaje)
      if (cancelled || !detalle || typeof detalle !== "object") return

      const detalleRecord = detalle as Record<string, unknown>
      const asignados = mapViajantesFromSource(
        detalleRecord.viajantes ?? detalle
      )

      if (!cancelled) {
        setViajantes(asignados.length > 0 ? asignados : nextViajantes)
      }

      const idMonedaDetalle =
        typeof detalleRecord.id_moneda === "number"
          ? String(detalleRecord.id_moneda)
          : typeof detalleRecord.id_moneda === "string"
            ? detalleRecord.id_moneda
            : null

      const nombreMonedaDetalle =
        typeof detalleRecord.moneda_nombre === "string"
          ? detalleRecord.moneda_nombre
          : typeof detalleRecord.moneda === "object" && detalleRecord.moneda
            ? String(
                (
                  detalleRecord.moneda as Record<string, unknown>
                ).nombre ?? ""
              )
            : ""

      const monedaEncontrada =
        idMonedaDetalle ??
        (nombreMonedaDetalle
          ? monedas.find(
              (moneda) =>
                (moneda.nombre ?? "")
                  .trim()
                  .toLowerCase() === nombreMonedaDetalle.trim().toLowerCase()
            )?.id_moneda
          : null)

      if (!cancelled && monedaEncontrada) {
        setSelectedMonedaId(String(monedaEncontrada))
      }
    }

    void syncViaje()

    return () => {
      cancelled = true
    }
  }, [open, viaje, onLoadDetalle, monedas])

  if (!viaje) return null

  const viajantesTexto = viajantes
    .map((v) =>
      `${v.nombre_usuario_viajante} ${v.apellido_usuario_viajante}`.trim()
    )
    .filter(Boolean)
    .join(", ")

  const canSubmit = selectedMonedaId !== ""

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar viaje</DialogTitle>
          <DialogDescription>
            Actualice los viajantes asignados y la moneda predeterminada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2 text-sm text-foreground">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Viajantes</h2>
              <Boton
                extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
                placeholder="EDITAR VIAJANTES"
                onClick={() => setSelectorOpen(true)}
              />
            </div>
            <p className="opacity-80">
              {viajantesTexto || "Sin viajantes asignados"}
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-foreground">
            <span>Moneda predeterminada</span>
            <SelectorConBusqueda
              placeholder="Seleccionar moneda"
              searchPlaceholder="Buscar moneda..."
              data={monedas.map((moneda) => ({
                id: String(moneda.id_moneda),
                nombre: moneda.nombre ?? `Moneda ${moneda.id_moneda}`,
              }))}
              value={selectedMonedaId}
              onValueChange={(value) => setSelectedMonedaId(value)}
              extraClass="w-full"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              await onSubmit({
                id_viaje: viaje.id_viaje,
                id_moneda: Number(selectedMonedaId),
                viajantes,
              })
              onClose()
            }}
          >
            Guardar
          </Button>
        </DialogFooter>

        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          {selectorOpen && (
            <SeleccionarViajantes
              initialSelected={viajantes}
              onSave={setViajantes}
              onClose={() => setSelectorOpen(false)}
            />
          )}
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export default function AgregarOpciones() {
  const { monedas, refresh, habilitarMoneda, deshabilitarMoneda, crearMoneda } =
    useMonedas()
  const {
    viajes,
    refresh: refreshViajes,
    habilitarViaje,
    deshabilitarViaje,
    crearViaje,
    editarViajantes,
    editarMoneda,
    obtenerDetalleViaje,
  } = useViajes()
  const {
    mediosPago,
    refresh: refreshMediosPago,
    habilitarMedioPago,
    deshabilitarMedioPago,
    crearMedioPago,
  } = useMediosPago()
  const {
    conceptos,
    refresh: refreshConceptos,
    habilitarConcepto,
    deshabilitarConcepto,
    crearConcepto,
  } = useConceptos()

  const [createOpen, setCreateOpen] = useState(false)
  const [createEntity, setCreateEntity] = useState<CreateEntityType | null>(
    null
  )
  const [editViaje, setEditViaje] = useState<Viaje | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const monedaItems: ToggleListItem[] = monedas.map((moneda) => ({
    id: moneda.id_moneda,
    nombre: moneda.nombre,
    estado: moneda.estado,
  }))

  const viajeItems: ToggleListItem[] = viajes.map((viaje) => ({
    id: viaje.id_viaje,
    nombre: viaje.nombre,
    estado: viaje.estado,
  }))

  const medioPagoItems: ToggleListItem[] = mediosPago.map((medio) => ({
    id: medio.id_medio_pago,
    nombre: medio.nombre,
    estado: medio.estado,
  }))

  const motivoItems: ToggleListItem[] = conceptos.map((concepto) => ({
    id: concepto.id_concepto,
    nombre: concepto.nombre,
    estado: concepto.estado,
  }))

  const toggleMoneda = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarMoneda(item.id)
    } else {
      await habilitarMoneda(item.id)
    }
    await refresh()
  }

  const toggleViaje = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarViaje(item.id)
    } else {
      await habilitarViaje(item.id)
    }
    await refreshViajes()
  }

  const toggleMedioPago = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarMedioPago(item.id)
    } else {
      await habilitarMedioPago(item.id)
    }
    await refreshMediosPago()
  }

  const toggleConcepto = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarConcepto(item.id)
    } else {
      await habilitarConcepto(item.id)
    }
    await refreshConceptos()
  }

  const handleCreateSubmit = async (payload: {
    nombre: string
    id_moneda?: number
  }) => {
    if (!createEntity) return

    switch (createEntity) {
      case "moneda":
        await crearMoneda(payload.nombre)
        break
      case "viaje":
        if (payload.id_moneda === undefined) return
        await crearViaje(payload.nombre, payload.id_moneda)
        break
      case "medioPago":
        await crearMedioPago(payload.nombre)
        break
      case "concepto":
        await crearConcepto(payload.nombre)
        break
    }
  }

  const handleEditViajeSubmit = async (payload: {
    id_viaje: number
    id_moneda: number
    viajantes: Viajante[]
  }) => {
    await editarViajantes({
      id_viaje: payload.id_viaje,
      viajantes: payload.viajantes,
    })
    await editarMoneda({
      id_viaje: payload.id_viaje,
      id_moneda: payload.id_moneda,
    })
    await refreshViajes()
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 rounded">
        <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
          <ToggleListCard
            title="VIAJES"
            buttonLabel="AGREGAR VIAJE"
            items={viajeItems}
            onToggle={toggleViaje}
            onEdit={async (item) => {
              const viajeSeleccionado = viajes.find(
                (viaje) => viaje.id_viaje === item.id
              )
              if (!viajeSeleccionado) return
              setEditViaje(viajeSeleccionado)
              setEditOpen(true)
            }}
            actionMode="edit"
            onAdd={() => {
              setCreateEntity("viaje")
              setCreateOpen(true)
            }}
          />

          <ToggleListCard
            title="MEDIO DE PAGO"
            buttonLabel="AGREGAR MEDIO DE PAGO"
            items={medioPagoItems}
            onToggle={toggleMedioPago}
            onAdd={() => {
              setCreateEntity("medioPago")
              setCreateOpen(true)
            }}
          />
        </div>

        <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
          <ToggleListCard
            title="DIVISAS"
            buttonLabel="AGREGAR DIVISAS"
            items={monedaItems}
            onToggle={toggleMoneda}
            onAdd={() => {
              setCreateEntity("moneda")
              setCreateOpen(true)
            }}
          />

          <ToggleListCard
            title="MOTIVOS"
            buttonLabel="AGREGAR MOTIVO"
            items={motivoItems}
            onToggle={toggleConcepto}
            onAdd={() => {
              setCreateEntity("concepto")
              setCreateOpen(true)
            }}
          />
        </div>
      </div>

      <CreateEntityDialog
        open={createOpen}
        entity={createEntity}
        monedas={monedas.map((moneda) => ({
          id: moneda.id_moneda,
          nombre: moneda.nombre,
        }))}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditViajeDialog
        key={editViaje?.id_viaje ?? "vacío"}
        open={editOpen}
        viaje={editViaje}
        monedas={monedas.map((moneda) => ({
          id_moneda: moneda.id_moneda,
          nombre: moneda.nombre,
        }))}
        onLoadDetalle={obtenerDetalleViaje}
        onClose={() => {
          setEditOpen(false)
          setEditViaje(null)
        }}
        onSubmit={handleEditViajeSubmit}
      />
    </>
  )
}
