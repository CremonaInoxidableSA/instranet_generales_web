import { useState, useMemo } from "react"
import { CircleMinus, CirclePlus } from "lucide-react"
import { Boton, BotonIcono, TextScrollArea } from "@/components/components"
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

          const Icono = item.estado ? CircleMinus : CirclePlus

          return (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate">{tag}</span>
              <BotonIcono
                icono={Icono}
                iconClass={
                  item.estado
                    ? "h-4 w-4 text-redcremona"
                    : "h-4 w-4 text-greencremona"
                }
                buttonClass="flex h-8 w-8 items-center justify-center hover:opacity-80"
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

export default function AgregarOpciones() {
  const { monedas, refresh, habilitarMoneda, deshabilitarMoneda } = useMonedas()
  const {
    viajes,
    refresh: refreshViajes,
    habilitarViaje,
    deshabilitarViaje,
  } = useViajes()
  const {
    mediosPago,
    refresh: refreshMediosPago,
    habilitarMedioPago,
    deshabilitarMedioPago,
  } = useMediosPago()
  const {
    conceptos,
    refresh: refreshConceptos,
    habilitarConcepto,
    deshabilitarConcepto,
  } = useConceptos()

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

  return (
    <div className="flex flex-1 flex-col gap-3 rounded">
      <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
        <ToggleListCard
          title="VIAJES"
          buttonLabel="AGREGAR VIAJE"
          items={viajeItems}
          onToggle={toggleViaje}
          onAdd={() => {}}
        />

        <ToggleListCard
          title="MEDIO DE PAGO"
          buttonLabel="AGREGAR MEDIO DE PAGO"
          items={medioPagoItems}
          onToggle={toggleMedioPago}
          onAdd={() => {}}
        />
      </div>

      <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
        <ToggleListCard
          title="DIVISAS"
          buttonLabel="AGREGAR DIVISAS"
          items={monedaItems}
          onToggle={toggleMoneda}
          onAdd={() => {}}
        />

        <ToggleListCard
          title="MOTIVOS"
          buttonLabel="AGREGAR MOTIVO"
          items={motivoItems}
          onToggle={toggleConcepto}
          onAdd={() => {}}
        />
      </div>
    </div>
  )
}
