"use client"

import { useState } from "react"
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
  onAprobar: () => void
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
  onAprobar,
}: Props) {
  const estado = getEstadoTicket(ticket?.estado)
  const [vistaGrandeAbierta, setVistaGrandeAbierta] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState("center")

  const manejarMovimientoZoom = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setZoomOrigin(`${x}% ${y}%`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="z-[80] bg-background2 sm:max-w-2xl">
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
              <button
                type="button"
                className="group relative h-72 overflow-hidden rounded-md border border-background6 bg-background3 text-left md:h-88"
                onClick={() => setVistaGrandeAbierta(true)}
                aria-label={`Abrir imagen ampliada de ${ticket.nombre_imagen}`}
              >
                {imageUrl ? (
                  <div
                    className="relative h-full w-full cursor-zoom-in overflow-hidden"
                    onMouseMove={manejarMovimientoZoom}
                    onMouseLeave={() => setZoomOrigin("center")}
                  >
                    <Image
                      src={imageUrl}
                      alt={ticket.nombre_imagen}
                      fill
                      unoptimized
                      className="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-150"
                      style={{ transformOrigin: zoomOrigin }}
                    />
                  </div>
                ) : (
                  <Skeleton className="h-full w-full rounded-md" />
                )}
              </button>

              <div className="flex flex-1 flex-col justify-between gap-3 text-sm">
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
                  <span className="font-medium">Nombre</span>
                  <span className="max-w-[60%] truncate text-foreground/80">
                    {ticket.nombre_imagen}
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
            {ticket?.estado === "POR APROBAR" && (
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

      {vistaGrandeAbierta && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-[2px]">
          <div className="relative flex h-[92vh] w-[92vw] items-center justify-center overflow-hidden rounded-md bg-background3 p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setVistaGrandeAbierta(false)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white"
            >
              Cerrar
            </button>

            {imageUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={imageUrl}
                  alt={ticket?.nombre_imagen ?? "Imagen del ticket"}
                  fill
                  unoptimized
                  className="h-full w-full rounded-md object-contain"
                />
              </div>
            ) : (
              <Skeleton className="h-[60vh] w-[60vw] rounded-md" />
            )}
          </div>
        </div>
      )}
    </>
  )
}
