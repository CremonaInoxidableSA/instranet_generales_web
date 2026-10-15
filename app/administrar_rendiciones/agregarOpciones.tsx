import { useState, useMemo } from "react"
import { CircleMinus, CirclePlus } from "lucide-react"
import {
  Boton,
  BotonIcono,
  SelectorConBusqueda,
  TextScrollArea,
} from "@/components/components"
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
  useConceptos,
  useMediosPago,
  useMonedas,
  useViajes,
} from "@/context/dataGeneralContext"

type ToggleListItem = {
  id: number
  nombre?: string
  estado?: boolean
}

type CreateEntityType = "moneda" | "viaje" | "medioPago" | "concepto"

function SectionCard({
  title,
  buttonLabel,
  onClick,
  children,
}: {
  title: string
  buttonLabel?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded bg-background2 p-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-semibold">{title}</h1>
        {buttonLabel && (
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder={buttonLabel}
            onClick={onClick}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function ToggleListCard({
  title,
  buttonLabel,
  items,
  onToggle,
  onAdd,
  emptyLabel = "Sin datos",
}: {
  title: string
  buttonLabel: string
  items: ToggleListItem[]
  onToggle: (item: ToggleListItem) => Promise<void> | void
  onAdd?: () => void
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm opacity-70">
          <input
            type="checkbox"
            checked={showDisabled}
            onChange={() => setShowDisabled((value) => !value)}
          />
          Mostrar deshabilitadas
        </label>
      </div>

      <TextScrollArea
        tags={
          visibleList.length > 0
            ? visibleList.map(
                (item) => item.nombre ?? String(item.id)
              )
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

          const Icono = item.estado ? CircleMinus : CirclePlus

          return (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate py-1">{tag}</span>
              <BotonIcono
                icono={Icono}
                iconClass={
                  item.estado
                    ? "h-4 w-4 text-redcremona"
                    : "h-4 w-4 text-greencremona"
                }
                onClick={async () => {
                  await onToggle(item)
                }}
                ariaLabel={
                  item.estado ? "Deshabilitar elemento" : "Habilitar elemento"
                }
                title={item.estado ? "Deshabilitar" : "Habilitar"}
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

export default function AgregarOpciones() {
  const { monedas, refresh, habilitarMoneda, deshabilitarMoneda, crearMoneda } =
    useMonedas()
  const {
    viajes,
    refresh: refreshViajes,
    habilitarViaje,
    deshabilitarViaje,
    crearViaje,
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

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 rounded">
        <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
          <ToggleListCard
            title="VIAJES"
            buttonLabel="AGREGAR VIAJE"
            items={viajeItems}
            onToggle={toggleViaje}
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
    </>
  )
}
