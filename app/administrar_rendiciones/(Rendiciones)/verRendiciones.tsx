"use client"

import Image from "next/image"
import { Check, Pencil } from "lucide-react"
import { Boton, BotonIcono, TextScrollArea } from "@/components/components"
import { Skeleton } from "@/components/ui/skeleton"
import { useVerRendiciones } from "./useVerRendiciones"
import { SeleccionarViajanteDialog } from "./(Dialogs)/SeleccionarViajanteDialog"
import { EditarViaticoDialog } from "./(Dialogs)/EditarViaticoDialog"
import { AgregarComentarioDialog } from "./(Dialogs)/AgregarComentarioDialog"

const truncarTexto = (texto: string, maxLength = 30) => {
  if (texto.length <= maxLength) return texto
  return `${texto.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

export default function VerRendiciones() {
  const r = useVerRendiciones()

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      {/* ---------- COLUMNA IZQUIERDA ---------- */}
      <div className="flex flex-1 flex-col gap-3 rounded">
        {/* Selección de viaje */}
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <div className="flex flex-col justify-between">
            <div className="flex flex-1 flex-row gap-3">
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
            {r.empleadoSeleccionadoInfo && (
              <p className="text-xs opacity-70">
                Viajante seleccionado: {r.empleadoSeleccionadoInfo.legajo}
                {r.empleadoSeleccionadoInfo.legajo ? " · " : ""}
                {r.empleadoSeleccionadoInfo.nombre}{" "}
                {r.empleadoSeleccionadoInfo.apellido}
              </p>
            )}
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
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
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
                const Icono = aprobado ? Check : Pencil
                return (
                  <div className="flex w-full flex-1 items-center justify-between gap-2">
                    <div className="flex flex-1 py-2">
                      <span>{tag}</span>
                    </div>
                    <BotonIcono
                      disabled={aprobado}
                      icono={Icono}
                      buttonClass="text-bluecremona disabled:pointer-events-none disabled:opacity-0"
                      aria-label={`Editar viático ${index + 1}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (aprobado) return
                        r.abrirEdicionViatico(v)
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
        <div className="flex flex-2 flex-col gap-3 rounded bg-background2 p-5">
          <h1 className="font-semibold">
            {r.empleadoSeleccionadoInfo
              ? `${r.empleadoSeleccionadoInfo.nombre} ${r.empleadoSeleccionadoInfo.apellido}`.trim()
              : "SIN VIAJANTE SELECCIONADO"}
            {" | "}
            {r.viajeActual?.nombre_viaje ?? "SIN VIAJE SELECCIONADO"}
          </h1>
          <div className="flex flex-row gap-2">
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO USD</p>
              <p className="text-sm opacity-50">U$D 631,14</p>
            </div>
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO ARS</p>
              <p className="text-sm opacity-50">AR$ 325.800</p>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO EUR</p>
              <p className="text-sm opacity-50">€UR 325.14</p>
            </div>
            <div className="flex-1 rounded bg-background3 p-3">
              <p className="text-md">TOTAL GASTO LOCAL</p>
              <p className="text-sm opacity-50">$ 325.14</p>
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
                const estado = (r.tickets[index]?.estado ?? "").toUpperCase()
                if (estado === "PENDIENTE") return "bg-orangecremona/10"
                if (estado === "APROBADO" || estado === "APROBADA")
                  return "bg-greencremona/10"
                return ""
              }}
              renderItem={({ tag, index, isSelected }) => {
                const ticket = r.tickets[index]
                const estado = (ticket?.estado ?? "").toUpperCase()
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
                    onClick={() => r.setReciboSeleccionado(index)}
                    className={`flex w-full flex-1 cursor-pointer items-center gap-3 py-2 ${isSelected ? "opacity-100" : ""}`}
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
                              ? "bg-orangecremona/20 text-orangecremona"
                              : estado === "APROBADO" || estado === "APROBADA"
                                ? "bg-greencremona/20 text-greencremona"
                                : "bg-background4 text-foreground/70",
                          ].join(" ")}
                        >
                          {estado || "PENDIENTE"}
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
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
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

      <EditarViaticoDialog
        open={r.dialogViaticoEdicionAbierto}
        onOpenChange={r.cerrarDialogEdicion}
        viaticoEditando={r.viaticoEditando}
        onChange={r.setViaticoEditando}
        monedas={r.monedas}
        loadingMonedas={r.loadingMonedas}
        onGuardar={r.guardarViaticoEditado}
        onAprobar={r.aprobarViatico}
      />

      <AgregarComentarioDialog
        open={r.dialogComentarioAbierto}
        onOpenChange={r.cerrarDialogComentario}
        texto={r.textoComentario}
        onTextoChange={r.setTextoComentario}
        onGuardar={r.guardarComentario}
      />
    </div>
  )
}
