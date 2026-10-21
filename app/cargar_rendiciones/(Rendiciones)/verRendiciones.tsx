"use client"

import { Check, Pencil } from "lucide-react"
import { Boton, BotonIcono, TextScrollArea } from "@/components/components"
import { useVerRendiciones } from "./useVerRendiciones"
import { EditarViaticoDialog } from "./(Dialogs)/EditarViaticoDialog"
import { AgregarComentarioDialog } from "./(Dialogs)/AgregarComentarioDialog"
import { DetalleTicketDialog } from "./(Dialogs)/DetalleTicketDialog"

export default function VerRendiciones() {
  const r = useVerRendiciones()

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      {/* ---------- COLUMNA IZQUIERDA ---------- */}
      <div className="flex flex-1 flex-col gap-3 rounded">
        {/* Selección de viaje */}
        <div className="flex min-h-100 flex-1 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <div className="flex flex-col justify-between">
            <h1 className="w-full font-semibold">SELECCIONE EL VIAJE</h1>
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
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-semibold">EFECTIVO ENTREGADO POR TESORERIA</h1>
            <Boton
              placeholder="AGREGAR VIATICO"
              extraClass="border-2 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
              disabled={!r.idViajeUsuarioActual}
              onClick={r.abrirCreacionViatico}
            />
          </div>
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
        <div className="flex min-h-175 flex-2 flex-col gap-3 rounded bg-background2 p-5 xl:min-h-0">
          <h1 className="font-semibold">
            {r.viajeActual?.nombre_viaje ?? "SIN VIAJE SELECCIONADO"}
          </h1>
          <div className="flex w-full flex-col gap-2 xl:flex-row">
            <div className="flex w-full flex-row gap-2">
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO USD</p>
                <p className="text-sm opacity-50">U$D 631,14</p>
              </div>
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO ARS</p>
                <p className="text-sm opacity-50">AR$ 325.800</p>
              </div>
            </div>
            <div className="flex w-full flex-row gap-2">
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO EUR</p>
                <p className="text-sm opacity-50">€UR 325.14</p>
              </div>
              <div className="flex-1 rounded bg-background3 p-2">
                <p className="text-sm">TOTAL GASTO LOCAL</p>
                <p className="text-sm opacity-50">$ 325.14</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center rounded border border-dashed border-background6 bg-background3/60 p-4">
            <Boton
              placeholder="AGREGAR RECIBOS"
              extraClass="border-2 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
              disabled={!r.idViajeUsuarioActual}
              onClick={() => undefined}
            />
          </div>
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
      <EditarViaticoDialog
        open={r.dialogViaticoEdicionAbierto}
        onOpenChange={r.cerrarDialogEdicion}
        viaticoEditando={r.viaticoEditando}
        onChange={r.setViaticoEditando}
        monedas={r.monedas}
        loadingMonedas={r.loadingMonedas}
        onGuardar={r.guardarViaticoEditado}
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
      />
    </div>
  )
}
