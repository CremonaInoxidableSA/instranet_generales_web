"use client"

import { Boton, SelectorConBusqueda } from "@/components/components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Moneda, ViaticoEditando } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  viaticoEditando: ViaticoEditando | null
  onChange: React.Dispatch<React.SetStateAction<ViaticoEditando | null>>
  monedas: Moneda[]
  loadingMonedas: boolean
  onGuardar: () => void
}

export function EditarViaticoDialog({
  open,
  onOpenChange,
  viaticoEditando,
  onChange,
  monedas,
  loadingMonedas,
  onGuardar,
}: Props) {
  const esCreacion = viaticoEditando?.id_viatico === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-100 bg-background2 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {esCreacion ? "Crear viático" : "Editar viático"}
          </DialogTitle>
          <DialogDescription>
            {esCreacion
              ? "Ingresá la moneda y los montos para registrar el viático."
              : "Actualizá la moneda y los montos del viático seleccionado."}
          </DialogDescription>
        </DialogHeader>

        {viaticoEditando && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Moneda</label>
              {loadingMonedas ? (
                <div className="rounded border border-dashed border-background6 bg-background3 px-3 py-2 text-sm opacity-60">
                  Cargando monedas...
                </div>
              ) : (
                <SelectorConBusqueda
                  placeholder="Seleccionar moneda"
                  searchPlaceholder="Buscar moneda..."
                  data={monedas}
                  value={viaticoEditando.id_moneda}
                  onValueChange={(value) =>
                    onChange((actual) =>
                      actual ? { ...actual, id_moneda: value } : actual
                    )
                  }
                  extraClass="w-full"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto entregado</label>
                <Input
                  type="number"
                  value={viaticoEditando.monto_entregado}
                  onChange={(event) =>
                    onChange((actual) =>
                      actual
                        ? { ...actual, monto_entregado: event.target.value }
                        : actual
                    )
                  }
                  className="border border-background6 bg-background3"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto devuelto</label>
                <Input
                  type="number"
                  value={viaticoEditando.monto_devuelto}
                  onChange={(event) =>
                    onChange((actual) =>
                      actual
                        ? { ...actual, monto_devuelto: event.target.value }
                        : actual
                    )
                  }
                  className="border border-background6 bg-background3"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Boton onClick={onGuardar}>{esCreacion ? "Crear" : "Guardar"}</Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
