"use client"

import { useAgregarOpciones } from "./useAgregarOpciones"
import { ToggleListCard } from "./ToggleListCard"
import { CreateEntityDialog } from "./(Dialog)/CreateEntityDialog"
import { EditViajeDialog } from "./(Dialog)/EditViajeDialog"

export default function AgregarOpciones() {
  const o = useAgregarOpciones()

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 rounded">
        <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
          <ToggleListCard
            title="VIAJES"
            buttonLabel="AGREGAR VIAJE"
            items={o.viajeItems}
            onToggle={o.toggleViaje}
            onEdit={o.abrirEdicionViaje}
            actionMode="edit"
            onAdd={() => o.abrirCreacion("viaje")}
          />

          <ToggleListCard
            title="MEDIO DE PAGO"
            buttonLabel="AGREGAR MEDIO DE PAGO"
            items={o.medioPagoItems}
            onToggle={o.toggleMedioPago}
            onAdd={() => o.abrirCreacion("medioPago")}
          />
        </div>

        <div className="flex min-h-200 flex-1 flex-col gap-3 xl:min-h-0 xl:flex-row">
          <ToggleListCard
            title="DIVISAS"
            buttonLabel="AGREGAR DIVISAS"
            items={o.monedaItems}
            onToggle={o.toggleMoneda}
            onAdd={() => o.abrirCreacion("moneda")}
          />

          <ToggleListCard
            title="MOTIVOS"
            buttonLabel="AGREGAR MOTIVO"
            items={o.motivoItems}
            onToggle={o.toggleConcepto}
            onAdd={() => o.abrirCreacion("concepto")}
          />
        </div>
      </div>

      <CreateEntityDialog
        open={o.createOpen}
        entity={o.createEntity}
        monedas={o.monedaOptions}
        onClose={o.cerrarCreacion}
        onSubmit={o.handleCreateSubmit}
      />

      <EditViajeDialog
        key={o.editViaje?.id_viaje ?? "vacío"}
        open={o.editOpen}
        viaje={o.editViaje}
        monedas={o.monedaOptions}
        onLoadDetalle={o.obtenerDetalleViaje}
        onToggleStatus={o.toggleViajeInDialog}
        onClose={o.cerrarEdicionViaje}
        onSubmit={o.handleEditViajeSubmit}
      />
    </>
  )
}
