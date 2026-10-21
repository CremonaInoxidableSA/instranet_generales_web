import type { Comentario, Viatico } from "@/types/types"

export type Empleado = {
  id: string
  nombre: string
  apellido: string
  legajo: string
}

export type ViajeDelEmpleado = {
  id_viaje: string
  id_viaje_usuario?: string
  nombre_viaje: string
}

export type ComentarioDelViaje = Pick<
  Comentario,
  | "nombre_usuario_creador"
  | "apellido_usuario_creador"
  | "comentario"
  | "fecha_creacion"
>

export type ViaticoDelViaje = Pick<
  Viatico,
  "id_viatico" | "id_moneda" | "monto_entregado" | "monto_devuelto"
> & {
  moneda: string
  estado: boolean
}

export type TicketDelViaje = {
  id_ticket: number
  nombre_imagen: string
  monto: number | null
  id_moneda?: number | null
  estado: string
}

export type TicketDetalle = {
  id_ticket: number
  nombre_imagen: string
  fecha_gasto?: string | null
  monto: number | null
  id_medio_pago?: number | null
  id_moneda?: number | null
  id_concepto?: number | null
  estado: string
  nombre_medio_pago?: string | null
  nombre_moneda?: string | null
  nombre_concepto?: string | null
}

export type Moneda = {
  id: string
  nombre: string
}

export type ViaticoEditando = {
  id_viatico: number
  id_moneda: string
  monto_entregado: string
  monto_devuelto: string
}

export type NuevoViatico = {
  id_moneda: string
  monto_entregado: string
  monto_devuelto: string
}
