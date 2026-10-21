import type { Viaje } from "@/types/types"

export type Viajante = {
  id_usuario_viajante: string
  nombre_usuario_viajante: string
  apellido_usuario_viajante: string
  legajo_usuario_viajante: string
}

export type EmpleadoRow = {
  id: string
  nombre: string
  apellido: string
  legajo: string
}

export type ToggleListItem = {
  id: number
  nombre?: string
  estado?: boolean
}

export type CreateEntityType = "moneda" | "viaje" | "medioPago" | "concepto"

export type CreatePayload = {
  nombre: string
  id_moneda?: number
}

export type EditViajePayload = {
  id_viaje: number
  id_moneda: number
  viajantes: Viajante[]
}

export type MonedaOption = {
  id_moneda: number
  nombre?: string
}

export type EditViajeDialogProps = {
  open: boolean
  viaje: Viaje | null
  monedas: MonedaOption[]
  onClose: () => void
  onSubmit: (payload: EditViajePayload) => Promise<void> | void
  onLoadDetalle?: (id_viaje: number) => Promise<Record<string, unknown> | null>
  onToggleStatus?: (
    item: ToggleListItem
  ) => Promise<boolean | void> | boolean | void
}
