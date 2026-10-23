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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  texto: string
  onTextoChange: (value: string) => void
  onGuardar: () => void
}

export function AgregarComentarioDialog({
  open,
  onOpenChange,
  texto,
  onTextoChange,
  onGuardar,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[80] bg-background2 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar comentario</DialogTitle>
          <DialogDescription>
            Escribí el comentario para el viaje seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <textarea
            value={texto}
            onChange={(event) => onTextoChange(event.target.value)}
            rows={5}
            placeholder="Escribí el comentario..."
            className="min-h-28 w-full rounded-md border border-background6 bg-background3 px-3 py-2 text-sm outline-none focus:border-bluecremona"
          />
        </div>

        <DialogFooter>
          <Boton onClick={onGuardar}>Guardar</Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
