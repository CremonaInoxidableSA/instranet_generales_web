"use client"

import { useState } from "react"
import { SelectorConBusqueda } from "@/components/components"
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
import type { CreateEntityType, CreatePayload, MonedaOption } from "../types"

type Props = {
  open: boolean
  entity: CreateEntityType | null
  monedas: MonedaOption[]
  onClose: () => void
  onSubmit: (payload: CreatePayload) => Promise<void> | void
}

const TITLE_MAP: Record<CreateEntityType, string> = {
  moneda: "Agregar moneda",
  viaje: "Agregar viaje",
  medioPago: "Agregar medio de pago",
  concepto: "Agregar motivo",
}

export function CreateEntityDialog({
  open,
  entity,
  monedas,
  onClose,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState("")
  const [selectedMonedaId, setSelectedMonedaId] = useState("")

  if (!entity) return null

  const isViaje = entity === "viaje"
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
          <DialogTitle>{TITLE_MAP[entity]}</DialogTitle>
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
