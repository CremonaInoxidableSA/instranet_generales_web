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
import type { Moneda, TicketEditando } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketEditando: TicketEditando | null
  onChange: React.Dispatch<React.SetStateAction<TicketEditando | null>>
  monedas: Moneda[]
  mediosPago: Moneda[]
  conceptos: Moneda[]
  loadingCatalogos: boolean
  onGuardar: () => void
}

export function EditarTicketDialog({
  open,
  onOpenChange,
  ticketEditando,
  onChange,
  monedas,
  mediosPago,
  conceptos,
  loadingCatalogos,
  onGuardar,
}: Props) {
  const habilitado =
    !!ticketEditando &&
    ticketEditando.nombre_imagen.trim() !== "" &&
    ticketEditando.fecha_gasto.trim() !== "" &&
    ticketEditando.monto.trim() !== "" &&
    ticketEditando.id_medio_pago.trim() !== "" &&
    ticketEditando.id_moneda.trim() !== "" &&
    ticketEditando.id_concepto.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[80] bg-background2 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar recibo</DialogTitle>
          <DialogDescription>
            Completá los datos del recibo para actualizar la información antes
            de guardar.
          </DialogDescription>
        </DialogHeader>

        {ticketEditando && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nombre de la imagen</label>
              <Input
                value={ticketEditando.nombre_imagen}
                onChange={(event) =>
                  onChange((actual) =>
                    actual
                      ? { ...actual, nombre_imagen: event.target.value }
                      : actual
                  )
                }
                placeholder="Ej: recibo-2026-10-22.png"
                className="border border-background6 bg-background3"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fecha de gasto</label>
                <Input
                  type="date"
                  value={ticketEditando.fecha_gasto}
                  onChange={(event) =>
                    onChange((actual) =>
                      actual
                        ? { ...actual, fecha_gasto: event.target.value }
                        : actual
                    )
                  }
                  className="border border-background6 bg-background3"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketEditando.monto}
                  onChange={(event) =>
                    onChange((actual) =>
                      actual ? { ...actual, monto: event.target.value } : actual
                    )
                  }
                  className="border border-background6 bg-background3"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Medio de pago</label>
              {loadingCatalogos ? (
                <div className="rounded border border-dashed border-background6 bg-background3 px-3 py-2 text-sm opacity-60">
                  Cargando medios de pago...
                </div>
              ) : (
                <SelectorConBusqueda
                  placeholder="Seleccionar medio de pago"
                  searchPlaceholder="Buscar medio de pago..."
                  data={mediosPago}
                  value={ticketEditando.id_medio_pago}
                  onValueChange={(value) =>
                    onChange((actual) =>
                      actual ? { ...actual, id_medio_pago: value } : actual
                    )
                  }
                  extraClass="w-full"
                />
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Moneda</label>
                {loadingCatalogos ? (
                  <div className="rounded border border-dashed border-background6 bg-background3 px-3 py-2 text-sm opacity-60">
                    Cargando monedas...
                  </div>
                ) : (
                  <SelectorConBusqueda
                    placeholder="Seleccionar moneda"
                    searchPlaceholder="Buscar moneda..."
                    data={monedas}
                    value={ticketEditando.id_moneda}
                    onValueChange={(value) =>
                      onChange((actual) =>
                        actual ? { ...actual, id_moneda: value } : actual
                      )
                    }
                    extraClass="w-full"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Concepto</label>
                {loadingCatalogos ? (
                  <div className="rounded border border-dashed border-background6 bg-background3 px-3 py-2 text-sm opacity-60">
                    Cargando conceptos...
                  </div>
                ) : (
                  <SelectorConBusqueda
                    placeholder="Seleccionar concepto"
                    searchPlaceholder="Buscar concepto..."
                    data={conceptos}
                    value={ticketEditando.id_concepto}
                    onValueChange={(value) =>
                      onChange((actual) =>
                        actual ? { ...actual, id_concepto: value } : actual
                      )
                    }
                    extraClass="w-full"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Boton
            type="button"
            onClick={onGuardar}
            disabled={!habilitado || loadingCatalogos}
            extraClass="border-2 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
          >
            Guardar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
