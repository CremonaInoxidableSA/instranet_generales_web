"use client"

import { Boton, SelectorConBusqueda } from "@/components/components"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEditViajeDialog } from "../useEditViajeDialog"
import type { EditViajeDialogProps, ToggleListItem } from "../types"
import { SeleccionarViajantesDialog } from "./SeleccionarViajantesDialog"

export function EditViajeDialog({
  open,
  viaje,
  monedas,
  onClose,
  onSubmit,
  onLoadDetalle,
  onToggleStatus,
}: EditViajeDialogProps) {
  const d = useEditViajeDialog({ open, viaje, monedas, onLoadDetalle })
  const monedasHabilitadas = monedas.filter((moneda) => {
    const estado = moneda.estado
    const estadoTexto = String(estado ?? "")
      .trim()
      .toLowerCase()

    const isInactive =
      estado === false ||
      estado === 0 ||
      estadoTexto === "false" ||
      estadoTexto === "0" ||
      estadoTexto === "inactivo" ||
      estadoTexto === "deshabilitado" ||
      estadoTexto === "disabled"

    if (isInactive) return false

    return (
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
    )
  })

  if (!viaje) return null

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
                onClick={() => d.setSelectorOpen(true)}
              />
            </div>
            <p className="opacity-80">
              {d.viajantesTexto || "Sin viajantes asignados"}
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-foreground">
            <span>Moneda predeterminada</span>
            <SelectorConBusqueda
              placeholder="Seleccionar moneda"
              searchPlaceholder="Buscar moneda..."
              data={monedasHabilitadas.map((moneda) => ({
                id: String(moneda.id_moneda),
                nombre: moneda.nombre ?? `Moneda ${moneda.id_moneda}`,
              }))}
              value={d.selectedMonedaId}
              onValueChange={(value) => d.setSelectedMonedaId(value)}
              extraClass="w-full z-[80]"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            className={
              viaje.estado === false
                ? "border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30"
                : "border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
            }
            onClick={async () => {
              if (!onToggleStatus) return

              const result = await onToggleStatus({
                id: viaje.id_viaje,
                nombre: viaje.nombre,
                estado: viaje.estado,
              } as ToggleListItem)

              if (result === false) {
                onClose()
              }
            }}
          >
            {viaje.estado === false ? "Habilitar viaje" : "Deshabilitar viaje"}
          </Button>
          <Button
            type="button"
            disabled={!d.canSubmit}
            onClick={async () => {
              await onSubmit({
                id_viaje: viaje.id_viaje,
                id_moneda: Number(d.selectedMonedaId),
                viajantes: d.viajantes,
              })
              onClose()
            }}
          >
            Guardar
          </Button>
        </DialogFooter>

        <Dialog open={d.selectorOpen} onOpenChange={d.setSelectorOpen}>
          {d.selectorOpen && (
            <SeleccionarViajantesDialog
              initialSelected={d.viajantes}
              onSave={d.setViajantes}
              onClose={() => d.setSelectorOpen(false)}
            />
          )}
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
