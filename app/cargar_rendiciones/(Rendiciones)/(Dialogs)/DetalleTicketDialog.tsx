"use client"

import Image from "next/image"
import { Boton } from "@/components/components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { TicketDetalle } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: TicketDetalle | null
  loading: boolean
  imageUrl?: string
  onEditar?: () => void
  onAprobar?: () => void
  onEliminar?: () => void
}

const getEstadoTicket = (estado?: string | null) => {
  const value = String(estado ?? "")
    .trim()
    .toUpperCase()

  if (value === "POR APROBAR") return "POR APROBAR"
  if (value.includes("APROB")) return "APROBADO"
  return "PENDIENTE"
}

const formatearFechaTicket = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"

  const valor = fecha.trim()
  const matchFechaIso = /^\d{4}-\d{2}-\d{2}$/.test(valor)

  if (!matchFechaIso) {
    const fechaParsed = new Date(valor)
    return Number.isNaN(fechaParsed.getTime())
      ? valor
      : fechaParsed.toLocaleDateString("es-AR", { dateStyle: "short" })
  }

  const [year, month, day] = valor.split("-").map(Number)
  const fechaLocal = new Date(year, month - 1, day)

  return fechaLocal.toLocaleDateString("es-AR", { dateStyle: "short" })
}

export function DetalleTicketDialog({
  open,
  onOpenChange,
  ticket,
  loading,
  imageUrl,
  onEditar,
  onAprobar,
  onEliminar,
}: Props) {
  const estado = getEstadoTicket(ticket?.estado)
  const puedeEditarTicket =
    !!ticket &&
    !["APROBADO", "APROBADA"].includes(
      String(ticket.estado ?? "")
        .trim()
        .toUpperCase()
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-100 bg-background2 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del recibo</DialogTitle>
          <DialogDescription>
            Revisá la imagen y los datos del ticket antes de aprobarlo.
          </DialogDescription>
        </DialogHeader>

        {loading || !ticket ? (
          <div className="flex flex-col gap-4 py-2">
            <Skeleton className="h-72 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ) : (
          <div className="grid gap-4 py-2 md:grid-cols-[minmax(220px,260px)_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-md border border-background6 bg-background3">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={ticket.nombre_imagen}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <Skeleton className="h-full w-full rounded-md" />
              )}
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Nombre</span>
                <span className="max-w-[60%] truncate text-right text-foreground/80">
                  {ticket.nombre_imagen}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Estado</span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                    estado === "PENDIENTE"
                      ? "bg-redcremona/20 text-redcremona"
                      : estado === "POR APROBAR"
                        ? "bg-orangecremona/20 text-orangecremona"
                        : "bg-greencremona/20 text-greencremona",
                  ].join(" ")}
                >
                  {estado}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Monto</span>
                <span className="text-foreground/80">
                  {ticket.monto !== null && ticket.monto !== undefined
                    ? `$${Number(ticket.monto).toLocaleString("es-AR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}`
                    : "Sin monto"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Moneda</span>
                <span className="text-foreground/80">
                  {ticket.nombre_moneda ?? "Sin moneda"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Medio de pago</span>
                <span className="text-foreground/80">
                  {ticket.nombre_medio_pago ?? "Sin medio de pago"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Concepto</span>
                <span className="text-foreground/80">
                  {ticket.nombre_concepto ?? "Sin concepto"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">Fecha</span>
                <span className="text-foreground/80">
                  {formatearFechaTicket(ticket.fecha_gasto)}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Boton onClick={() => onOpenChange(false)}>Cerrar</Boton>
          {onEditar && puedeEditarTicket && (
            <Boton
              onClick={onEditar}
              extraClass="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
            >
              Editar
            </Boton>
          )}
          {onEliminar && (
            <Boton
              onClick={() => {
                onEliminar()
              }}
              extraClass="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
            >
              Eliminar
            </Boton>
          )}
          {onAprobar && ticket?.estado === "POR APROBAR" && (
            <Boton
              onClick={onAprobar}
              extraClass="border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30"
            >
              Aprobar
            </Boton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
