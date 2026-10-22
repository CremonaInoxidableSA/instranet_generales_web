"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { Boton, BotonIcono, TextScrollArea } from "@/components/components"
import { AlertDialogTemplate } from "@/components/componentsClient"
import { Skeleton } from "@/components/ui/skeleton"
import { useVerRendiciones } from "./useVerRendiciones"
import { SeleccionarViajanteDialog } from "./(Dialogs)/SeleccionarViajanteDialog"
import { AgregarComentarioDialog } from "./(Dialogs)/AgregarComentarioDialog"
import { DetalleTicketDialog } from "./(Dialogs)/DetalleTicketDialog"

const truncarTexto = (texto: string, maxLength = 30) => {
  if (texto.length <= maxLength) return texto
  return `${texto.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

const getEstadoTicket = (estado?: string | null) => {
  const value = String(estado ?? "")
    .trim()
    .toUpperCase()

  if (value === "POR APROBAR") return "POR APROBAR"
  if (value.includes("APROB")) return "APROBADO"
  return "PENDIENTE"
}

const formatearMonto = (valor: number | string | undefined | null) =>
  Number(valor ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

export default function VerRendiciones() {
  const r = useVerRendiciones()

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      {/* ---------- COLUMNA IZQUIERDA ---------- */}
      <div className="flex flex-1 flex-col gap-3 rounded">
        {/* Selección de viaje */}
        <div className="flex min-h-100 flex-1 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <div className="gap-3 flex flex-row justify-between">
            <h1 className="w-full font-semibold">SELECCIONE EL VIAJE</h1>
            <Boton
              onClick={r.abrirDialogViajante}
              disabled={r.loadingEmpleados}
              extraClass="rounded border-2 border-bluecremona bg-bluecremona/20 text-sm text-bluecremona hover:bg-bluecremona/30"
            >
              <span>
                {r.loadingEmpleados
                  ? "Cargando empleados..."
                  : r.empleadoSeleccionadoInfo
                    ? `${r.empleadoSeleccionadoInfo.nombre} ${r.empleadoSeleccionadoInfo.apellido}`.trim()
                    : "Seleccionar viajante"}
              </span>
            </Boton>
          </div>

          {r.loadingViajes ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando viajes...
            </div>
          ) : (
            <TextScrollArea
              tags={r.viajesTags}
              subtitles={r.viajesSubtitles}
              selectedIndex={r.viajeSeleccionado}
              onTagClick={(_tag, index) => r.seleccionarViaje(index)}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>

        {/* Efectivo entregado */}
        <div className="flex min-h-100 flex-1 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <h1 className="font-semibold">EFECTIVO ENTREGADO POR TESORERIA</h1>
          {r.loadingViaticos ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando efectivo...
            </div>
          ) : (
            <TextScrollArea
              tags={r.viaticos.map((v) => {
                const entregado = Number(v.monto_entregado ?? 0)
                const devuelto = Number(v.monto_devuelto ?? 0)
                return `${v.moneda}: $${entregado.toLocaleString("es-AR")} / Devuelto: $${devuelto.toLocaleString("es-AR")}`
              })}
              extraClass="flex-1 min-h-0"
              rowClassName={(_tag, index) =>
                r.viaticos[index]?.estado ? "bg-greencremona/10" : ""
              }
              renderItem={({ tag, index }) => {
                const v = r.viaticos[index]
                const aprobado = Boolean(v?.estado)
                return (
                  <div className="flex w-full flex-1 items-center justify-between gap-2">
                    <div className="flex flex-1 py-2">
                      <span>{tag}</span>
                    </div>
                    <BotonIcono
                      disabled={aprobado}
                      icono={Check}
                      buttonClass={
                        aprobado
                          ? "text-greencremona disabled:pointer-events-none disabled:opacity-0"
                          : "text-foreground/60 hover:text-greencremona"
                      }
                      aria-label={`Aprobar viático ${index + 1}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (aprobado || !v) return
                        r.abrirConfirmacionAprobacionViatico(v)
                      }}
                    />
                  </div>
                )
              }}
            />
          )}
        </div>
      </div>

      {/* ---------- COLUMNA DERECHA ---------- */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Resumen + recibos */}
        <div className="flex min-h-175 flex-2 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <h1 className="font-semibold">
            {r.empleadoSeleccionadoInfo
              ? `${r.empleadoSeleccionadoInfo.nombre} ${r.empleadoSeleccionadoInfo.apellido}`.trim()
              : "SIN VIAJANTE SELECCIONADO"}
            {" | "}
            {r.viajeActual?.nombre_viaje ?? "SIN VIAJE SELECCIONADO"}
          </h1>
          <div className="flex w-full flex-col gap-2 xl:flex-row">
            <div className="flex w-full flex-row gap-2">
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO USD</p>
                <p className="text-sm opacity-50">
                  U$D {formatearMonto(r.gastosViaje.usd)}
                </p>
              </div>
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO ARS</p>
                <p className="text-sm opacity-50">
                  AR$ {formatearMonto(r.gastosViaje.ars)}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-row gap-2">
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO EUR</p>
                <p className="text-sm opacity-50">
                  € {formatearMonto(r.gastosViaje.eur)}
                </p>
              </div>
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO LOCAL</p>
                <p className="text-sm opacity-50">
                  $ {formatearMonto(r.gastosViaje.otr)}
                </p>
              </div>
            </div>
          </div>

          {r.loadingTickets ? (
            <div className="flex flex-1 flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`ticket-skeleton-${index}`}
                  className="flex items-center gap-3 rounded bg-background3 p-2"
                >
                  <Skeleton className="h-14 w-14 rounded-md" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TextScrollArea
              placeholder="RECIBOS"
              tags={r.tickets.map((ticket) => ticket.nombre_imagen)}
              selectedIndex={r.reciboSeleccionado}
              onTagClick={(_tag, index) => r.setReciboSeleccionado(index)}
              extraClass="flex-1 min-h-0"
              rowClassName={(_tag, index) => {
                const estado = getEstadoTicket(r.tickets[index]?.estado)
                if (estado === "PENDIENTE") return "bg-redcremona/10"
                if (estado === "POR APROBAR") return "bg-orangecremona/10"
                if (estado === "APROBADO") return "bg-greencremona/10"
                return ""
              }}
              renderItem={({ tag, index }) => {
                const ticket = r.tickets[index]
                const estado = getEstadoTicket(ticket?.estado)
                const montoTexto =
                  ticket?.monto !== null && ticket?.monto !== undefined
                    ? Number(ticket.monto).toLocaleString("es-AR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : "Sin monto"
                const imageUrl = ticket
                  ? r.ticketImagenes[ticket.id_ticket]
                  : undefined
                const estaCargandoImagen = ticket
                  ? Boolean(r.loadingTicketImagenes[ticket.id_ticket])
                  : false

                return (
                  <div
                    onClick={() => {
                      r.abrirDetalleTicket(ticket)
                    }}
                    className="flex w-full flex-1 cursor-pointer items-center gap-3 py-2"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-background6 bg-background3">
                      {estaCargandoImagen ? (
                        <Skeleton className="h-full w-full rounded-md" />
                      ) : imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={tag}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <Skeleton className="h-full w-full rounded-md" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {truncarTexto(tag || "Recibo sin nombre")}
                        </span>
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                            estado === "PENDIENTE"
                              ? "bg-redcremona/20 text-redcremona"
                              : estado === "POR APROBAR"
                                ? "bg-orangecremona/20 text-orangecremona"
                                : estado === "APROBADO"
                                  ? "bg-greencremona/20 text-greencremona"
                                  : "bg-background4 text-foreground/70",
                          ].join(" ")}
                        >
                          {estado}
                        </span>
                      </div>
                      <span className="text-xs opacity-70">
                        Monto: ${montoTexto}
                      </span>
                    </div>
                  </div>
                )
              }}
            />
          )}
        </div>

        {/* Comentarios */}
        <div className="flex min-h-100 flex-1 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <div className="flex flex-row items-center justify-between gap-3">
            <h1 className="font-semibold">COMENTARIOS</h1>
            <Boton
              extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
              placeholder="AGREGAR COMENTARIO"
              disabled={!r.idViajeUsuarioActual}
              onClick={r.abrirDialogComentario}
            />
          </div>
          {r.loadingComentarios ? (
            <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 p-3 text-sm opacity-60">
              Cargando comentarios...
            </div>
          ) : (
            <TextScrollArea
              tags={r.comentarios.map((c) => c.comentario || "Sin comentario")}
              subtitles={r.comentarios.map((c) => {
                const autor =
                  `${c.nombre_usuario_creador} ${c.apellido_usuario_creador}`.trim()
                const fecha = c.fecha_creacion
                  ? new Date(c.fecha_creacion).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Sin fecha"
                return `${autor || "Usuario"} · ${fecha}`
              })}
              extraClass="flex-1 min-h-0"
            />
          )}
        </div>
      </div>

      {/* ---------- DIÁLOGOS ---------- */}
      <SeleccionarViajanteDialog
        open={r.dialogAbierto}
        onOpenChange={r.cerrarDialogViajante}
        loading={r.loadingEmpleados}
        filtroInput={r.filtroInput}
        onFiltroInputChange={r.setFiltroInput}
        onAplicarFiltro={r.aplicarFiltro}
        onLimpiarFiltro={r.limpiarFiltro}
        filasPagina={r.filasPagina}
        empleadoSeleccionado={r.empleadoSeleccionado}
        onSeleccionarEmpleado={r.seleccionarEmpleado}
        paginaActual={r.paginaActual}
        totalPaginas={r.totalPaginas}
        onPaginaAnterior={r.paginaAnterior}
        onPaginaSiguiente={r.paginaSiguiente}
      />

      <AlertDialogTemplate
        open={r.dialogAprobacionViaticoAbierto}
        onOpenChange={r.cerrarDialogAprobacionViatico}
        title="Aprobar viático"
        description={
          r.viaticoAprobacion
            ? `¿Querés aprobar este viático de ${r.viaticoAprobacion.moneda}?`
            : "¿Querés aprobar este viático?"
        }
        onConfirm={r.confirmarAprobacionViatico}
        confirmText="Aprobar"
      />

      <AgregarComentarioDialog
        open={r.dialogComentarioAbierto}
        onOpenChange={r.cerrarDialogComentario}
        texto={r.textoComentario}
        onTextoChange={r.setTextoComentario}
        onGuardar={r.guardarComentario}
      />

      <DetalleTicketDialog
        open={r.dialogTicketDetalleAbierto}
        onOpenChange={r.cerrarDetalleTicket}
        ticket={r.ticketDetalle}
        loading={r.loadingTicketDetalle}
        imageUrl={
          r.ticketDetalle
            ? r.ticketImagenes[r.ticketDetalle.id_ticket]
            : undefined
        }
        onAprobar={() =>
          r.ticketDetalle
            ? r.aprobarTicket(r.ticketDetalle.id_ticket)
            : undefined
        }
      />
    </div>
  )
}
