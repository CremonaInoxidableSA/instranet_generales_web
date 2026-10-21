import type { EmpleadoRow, Viajante } from "./types"

export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

export const mapViajante = (item: Record<string, unknown>): Viajante => ({
  id_usuario_viajante: String(item.id_usuario_viajante ?? item.id ?? "").trim(),
  nombre_usuario_viajante: String(item.nombre_usuario_viajante ?? ""),
  apellido_usuario_viajante: String(item.apellido_usuario_viajante ?? ""),
  legajo_usuario_viajante: String(item.legajo_usuario_viajante ?? ""),
})

export const mapViajantesFromSource = (source: unknown): Viajante[] => {
  const raw = Array.isArray(source)
    ? source
    : source && typeof source === "object"
      ? ((source as Record<string, unknown>).viajantes ?? [])
      : []

  if (!Array.isArray(raw)) return []

  return raw
    .map((item) =>
      item && typeof item === "object"
        ? mapViajante(item as Record<string, unknown>)
        : null
    )
    .filter(
      (item): item is Viajante => !!item && item.id_usuario_viajante !== ""
    )
}

export const toEmpleadoRow = (e: Record<string, unknown>): EmpleadoRow => ({
  id: String(e.id_usuario ?? e.id ?? ""),
  nombre: String(e.nombre ?? ""),
  apellido: String(e.apellido ?? ""),
  legajo: e.legajo === null || e.legajo === undefined ? "" : String(e.legajo),
})
