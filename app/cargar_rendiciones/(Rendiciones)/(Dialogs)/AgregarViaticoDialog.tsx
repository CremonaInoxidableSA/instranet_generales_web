"use client"

import { Boton } from "@/components/components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { NuevoViatico } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: NuevoViatico
  onChange: React.Dispatch<React.SetStateAction<NuevoViatico>>
  onGuardar: () => void
}

export function AgregarViaticoDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onGuardar,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={value.id_moneda}
              onChange={(event) =>
                onChange((actual) => ({
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
                value={value.monto_entregado}
                onChange={(event) =>
                  onChange((actual) => ({
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
                value={value.monto_devuelto}
                onChange={(event) =>
                  onChange((actual) => ({
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
          <Boton onClick={() => onOpenChange(false)}>Cancelar</Boton>
          <Boton onClick={onGuardar}>Guardar</Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
