import type { ReactNode } from "react"

export interface PermisosData {
  nombre?: string
  descripcion?: string
}

export interface ModulosData {
  nombre?: string
  subdominio?: string
  path?: string
  icono?: string
  habilitado?: boolean
}

export interface SubmodulosData {
  nombre?: string
  modulo_padre?: string
  path?: string
  icono?: string
  habilitado?: boolean
}

export interface GruposData {
  nombre?: string
  permisos?: (string | PermisosData)[]
  modulos?: (string | ModuloPersonal)[]
  submodulos?: (string | SubmodulosData)[]
}

export interface UsersData {
  id?: string
  email?: string
  nombre?: string
  apellido?: string
  legajo?: number
  dni?: number
  habilitado?: boolean
  cambiar_password?: boolean
  password?: string
  password_confirmation?: string
  grupos?: (string | GruposData)[]
  modulos?: (string | ModulosData)[]
  submodulos?: (string | SubmodulosData)[]
  modulos_personales?: Record<string, ModuloPersonal>
  submodulos_personales?: Record<string, SubmoduloPersonal>
  permisos?: (string | PermisosData)[]

  grupo?: string
  apellidoNombre?: string
}

// ─────────────────────────────────────────────────────────────────────────
// TIPOS PARA OPERACIONES CRUD
// ─────────────────────────────────────────────────────────────────────────

// Para listados y detalles (lo que devuelve la API)
export type ApiResponse<T> = T

export interface ApiListResult<T, P = Paginacion> {
  data: T[]
  paginacion: P
}

export interface FetchParams {
  numeroPagina?: number
  filtro?: string | null
}

// Para paginación
export interface Paginacion {
  total_paginas: number
  total_registros: number
}

// Para respuestas de listado paginado
export interface ListadoPaginado<T, P = Paginacion> {
  data: T[]
  paginacion: P
}

// Para respuestas simples de detalle
export type DetalleResponse<T> = T

// Para respuestas de operaciones (crear/editar/eliminar)
export interface OperacionResponse {
  detail: string
}

// ─────────────────────────────────────────────────────────────────────────
// UTILITY TYPES para validación en diferentes contextos
// ─────────────────────────────────────────────────────────────────────────

// Para operaciones de creación (requiere campos mínimos)
export type Crear<T> = Required<Pick<T, keyof T>>

// Para operaciones de edición (todos opcionales excepto identificador)
export type Editar<T> = Partial<T>

// Para listados (solo los campos que normalmente se muestran)
export type Listar<T> = Pick<T, keyof T>

// ─────────────────────────────────────────────────────────────────────────
// CONTEXTOS DE AUTENTICACIÓN Y COMPONENTES
// ─────────────────────────────────────────────────────────────────────────

export interface AuthContextType {
  user: UsersData | null
  loading: boolean
  login: () => Promise<OperacionResponse>
  logout: () => Promise<boolean>
}

export interface UserAvatarProps {
  nombre?: string | null
  apellido?: string | null
  loading?: boolean
  sizeClass?: string
  textClass?: string
}

// ─────────────────────────────────────────────────────────────────────────
// MAPEO DE MÓDULOS PERSONALES (caso específico)
// ─────────────────────────────────────────────────────────────────────────

export interface ModuloPersonal {
  path: string
  icono: string
  habilitado: boolean
}

export interface SubmoduloPersonal {
  path: string
  icono: string
}

export type ModulosPersonales = Record<string, ModuloPersonal>
export type SubmodulosPersonales = Record<string, SubmoduloPersonal>

// ------------------------------------DOMINIO PRODUCCION------------------------------------

export interface Sector {
  id_sector: number
  nombre: string
}

export interface Producto {
  id_producto: number
  nombre: string
  sectores: string[]
}

export interface Labor {
  id_labor: number
  nombre: string
}

export interface Operario {
  id?: string | number | null
  id_operario?: number | string
  nombre: string
  apellido: string
  nombre_completo?: string
  legajo: number
  grupo: string
  grupo_display?: string
  email?: string
  dni?: number

  detail?: string
  nombre_labor?: string
  nombre_creador?: string
  apellido_creador?: string
  id_tarea?: number
}

export interface LaborProducto {
  id_labor: number
  nombre: string
  sector: string
}

export interface FiltrosMonitoreo {
  numeros_op: number[]
  numeros_plano: string[]
  operarios: string[]
  sectores: string[]
}

export interface TareaUsuario {
  id_tarea: number
  nombre_operario_seleccionado: string
  apellido_operario_seleccionado: string
  nombre_producto: string
  nombre_labor: string
  estado: string
  cantidad: number
}

export interface DetalleTarea {
  id_tarea: number
  nombre_operario_seleccionado: string
  apellido_operario_seleccionado: string
  nombre_sector: string
  numero_op: number
  numero_plano: string
  nombre_producto: string
  nombre_labor: string
  descripcion: string
  tiempo_extra: string
  estado: string
  fecha_inicio?: Date
  apellido_creador?: string
  nombre_creador?: string
  fecha_fin?: Date
  tiempo_cronometrado?: string
  tiempo_total?: string
  cantidad: number
  eventos?: EventoTareaFinalizada[]
}

export interface EventoTareaFinalizada {
  fecha: Date
  titulo: string
}

export interface Tarea {
  id_tarea: number
  nombre_operario_seleccionado: string
  apellido_operario_seleccionado: string
  nombre_producto: string
  nombre_labor: string
  cantidad: number
  estado: string
}

// ------------------------------------CONEXION Y CONTEXTO------------------------------------

export type ApiConnectionSource = "produccion" | "auth" | "unknown"

export interface ConnectionErrorState {
  hasError: boolean
  failedApis: ApiConnectionSource[]
  messages: string[]
}

export type ConnectionErrorListener = (state: ConnectionErrorState) => void

export interface ConnectionErrorItem {
  apiSource: ApiConnectionSource
  message: string
}

export interface ConnectionContextType {
  isConnectionError: boolean
  connectionErrors: ConnectionErrorItem[]
  resetConnectionError: () => void
}

export interface UserContextType {
  id_current_user: string
  nombre_usuario_logeado: string
  apellido_usuario_logeado: string
}

// ------------------------------------PAGINAS Y HOOKS------------------------------------
export interface CrearTareaResponse {
  id_tarea?: number
}

export interface TareaEditorProps {
  refetch: () => Promise<void>
  removeTareaLocal: (id: number) => void
}

export interface MonitoreoTareaEditorProps extends TareaEditorProps {
  onAfterAction?: () => void | Promise<void>
}

export interface FormState {
  descripcion: string
  tiempoExtra: string
  cantidad: number
  dirty: boolean
}

export interface SetFormAction {
  type: "SET_FORM"
  payload: { descripcion: string; tiempoExtra: string; cantidad: number }
}

export interface UpdateDescripcionAction {
  type: "UPDATE_DESCRIPCION"
  payload: string
}

export interface UpdateTiempoExtraAction {
  type: "UPDATE_TIEMPO_EXTRA"
  payload: string
}

export interface ResetDirtyAction {
  type: "RESET_DIRTY"
}

export interface SetDirtyAction {
  type: "SET_DIRTY"
}

export type FormAction =
  | SetFormAction
  | UpdateDescripcionAction
  | UpdateTiempoExtraAction
  | ResetDirtyAction
  | SetDirtyAction

export type NombreConNombre = string | { nombre?: string } | null | undefined

// ------------------------------------COMPONENTES------------------------------------

export type SimpleArray = (string | number | undefined)[]
export type ObjectArray = object[]
export type ArrayData = SimpleArray | ObjectArray

export interface ItemCardProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  href?: string
  variant?: "default" | "outline" | "muted"
  size?: "default" | "sm" | "xs"
  className?: string
  children?: ReactNode
  showChevron?: boolean
}

export interface CronometroEdicionProps {
  value: string
  estado?: string
  onTogglePausa?: () => void
  onReiniciar?: () => void
}

export interface CambioPassProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
