import type {
  ComentarioDelViaje,
  Empleado,
  ViaticoDelViaje,
  ViajeDelEmpleado,
} from "./types"

export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export const mapEmpleado = (item: Record<string, unknown>): Empleado => ({
  id: String(item.id_usuario ?? item.id ?? "").trim(),
  nombre: String(item.nombre ?? ""),
  apellido: String(item.apellido ?? ""),
  legajo:
    item.legajo === null || item.legajo === undefined
      ? ""
      : String(item.legajo),
})

export const mapViajeDelEmpleado = (
  item: Record<string, unknown>
): ViajeDelEmpleado | null => {
  const idViaje = item.id_viaje ?? item.id_viaje_usuario ?? item.id ?? ""
  const idViajeUsuario = item.id_viaje_usuario ?? item.id ?? ""
  const nombreViaje = String(item.nombre_viaje ?? item.nombre ?? "").trim()

  if (!idViaje && !nombreViaje) return null

  return {
    id_viaje: String(idViaje),
    id_viaje_usuario: String(idViajeUsuario),
    nombre_viaje: nombreViaje || `Viaje ${String(idViaje)}`,
  }
}

export const mapComentarioDelViaje = (
  item: Record<string, unknown>
): ComentarioDelViaje | null => {
  const comentario = String(item.comentario ?? "").trim()
  const nombre = String(item.nombre_usuario_creador ?? "").trim()
  const apellido = String(item.apellido_usuario_creador ?? "").trim()
  const fechaCreacion = String(item.fecha_creacion ?? "").trim()

  if (!comentario && !nombre && !apellido && !fechaCreacion) return null

  return {
    nombre_usuario_creador: nombre,
    apellido_usuario_creador: apellido,
    comentario: comentario || "Sin comentario",
    fecha_creacion: fechaCreacion,
  }
}

export const mapViaticoDelViaje = (
  item: Record<string, unknown>
): ViaticoDelViaje | null => {
  const idViatico = item.id_viatico ?? item.id ?? ""
  const idMoneda = item.id_moneda ?? item.id_moneda_viatico ?? item.id ?? ""
  const moneda =
    String(item.nombre_moneda ?? item.moneda ?? "").trim() || "Sin moneda"
  const montoEntregado =
    item.monto_entregado === null || item.monto_entregado === undefined
      ? 0
      : Number(item.monto_entregado)
  const montoDevuelto =
    item.monto_devuelto === null || item.monto_devuelto === undefined
      ? 0
      : Number(item.monto_devuelto)
  const estado = Boolean(item.estado)

  if (!idViatico && !moneda && !montoEntregado && !montoDevuelto) return null

  return {
    id_viatico: Number(idViatico) || 0,
    id_moneda: Number(idMoneda) || undefined,
    moneda,
    monto_entregado: montoEntregado,
    monto_devuelto: montoDevuelto,
    estado,
  }
}
