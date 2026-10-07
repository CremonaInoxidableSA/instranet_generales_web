"use client"

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react"

import {
  AuthContextType,
  OperacionResponse,
  UsersData,
  PermisosData,
  SubmodulosData,
  ModulosData,
  GruposData,
  ModulosPersonales,
  SubmodulosPersonales,
} from "@/types/types"

import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { toast } from "sonner"
import {
  initKeycloakSession,
  keycloakLogin,
  keycloakLogout,
} from "@/lib/keycloak/keycloakService"

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

const normalizeAccesosPersonales = (
  value: unknown
): Record<string, { path: string; icono: string }> => {
  const payload = toRecord(value)

  if (!payload) {
    return {}
  }

  return Object.entries(payload).reduce<
    Record<string, { path: string; icono: string }>
  >((acc, [nombre, acceso]) => {
    const detalle = toRecord(acceso)

    if (!detalle) {
      return acc
    }

    const path = typeof detalle.path === "string" ? detalle.path : ""
    const icono = typeof detalle.icono === "string" ? detalle.icono : ""

    acc[nombre] = {
      path,
      icono,
    }

    return acc
  }, {})
}

const getPayloadData = (payload: unknown) => {
  const payloadRecord = toRecord(payload)

  if (!payloadRecord) {
    return payload
  }

  const dataField = payloadRecord.data
  const dataRecord = toRecord(dataField)

  return dataRecord ?? payload
}

const parseErrorMessage = (payload: unknown, status: number) => {
  const payloadRecord = toRecord(payload)

  const serverMessage =
    typeof payloadRecord?.error === "string"
      ? payloadRecord.error
      : typeof payloadRecord?.detail === "string"
        ? payloadRecord.detail
        : typeof payloadRecord?.message === "string"
          ? payloadRecord.message
          : null

  return (
    serverMessage ??
    `No se pudo obtener la informacion del usuario (HTTP ${status})`
  )
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)

  const initTriggered = useRef(false)

  const getJsonResponse = async (endpoint: string) => {
    const response = await fetchWithKeycloak(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(parseErrorMessage(payload, response.status))
    }

    return getPayloadData(payload)
  }

  const getUserDetails = useCallback(async (): Promise<UsersData> => {
    const [detailsPayload, modulosPayload, submodulosPayload] =
      await Promise.all([
        getJsonResponse("/api/auth/detalles"),
        getJsonResponse("/api/auth/modulos-personales"),
        getJsonResponse("/api/auth/submodulos-personales"),
      ])

    const data = toRecord(detailsPayload)

    if (!data) {
      throw new Error("La API devolvio una respuesta vacia")
    }

    const modulosPersonales = normalizeAccesosPersonales(
      modulosPayload
    ) as ModulosPersonales

    const submodulosPersonales = normalizeAccesosPersonales(
      submodulosPayload
    ) as SubmodulosPersonales

    const submodulosPermiso = Object.keys(submodulosPersonales).map(
      (nombre) => ({ nombre })
    ) as SubmodulosData[]

    const modulosLista = Object.entries(modulosPersonales).map(
      ([nombre, modulo]) => ({
        nombre,
        path: modulo.path,
        icono: modulo.icono,
      })
    ) as ModulosData[]

    const legajo =
      typeof data.legajo === "number"
        ? data.legajo
        : Number(data.legajo ?? Number.NaN)

    const dni =
      typeof data.dni === "number" ? data.dni : Number(data.dni ?? Number.NaN)

    if (!Number.isFinite(legajo) || !Number.isFinite(dni)) {
      throw new Error(
        "Respuesta inválida en /api/personal/detalles: faltan legajo o dni"
      )
    }

    return {
      email: typeof data.email === "string" ? data.email : "",
      nombre: typeof data.nombre === "string" ? data.nombre : "",
      apellido: typeof data.apellido === "string" ? data.apellido : "",
      legajo,
      dni,

      grupos: Array.isArray(data.grupos) ? (data.grupos as GruposData[]) : [],
      modulos: modulosLista,
      submodulos: submodulosPermiso,
      modulos_personales: modulosPersonales,
      submodulos_personales: submodulosPersonales,

      permisos: Array.isArray(data.permisos)
        ? (data.permisos as PermisosData[])
        : [],

      id: typeof data.id === "string" ? data.id : "",
      habilitado:
        typeof data.habilitado === "boolean" ? data.habilitado : false,
      apellidoNombre:
        typeof data.apellidoNombre === "string" ? data.apellidoNombre : "",
      cambiar_password:
        typeof data.cambiar_password === "boolean"
          ? data.cambiar_password
          : false,
    }
  }, [])

  const initKeycloak = useCallback(async () => {
    if (user) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const authenticated = await initKeycloakSession()

      if (!authenticated) {
        await keycloakLogin()
        return
      }

      const userDetails = await getUserDetails()
      setUser(userDetails)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [user, getUserDetails])

  useEffect(() => {
    if (!initTriggered.current) {
      initTriggered.current = true
      void initKeycloak()
    }
  }, [initKeycloak])

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && user) {
        setLoading(false)
      }
    }

    window.addEventListener("pageshow", handlePageShow)
    return () => window.removeEventListener("pageshow", handlePageShow)
  }, [user])

  const login = async (): Promise<OperacionResponse> => {
    try {
      setLoading(true)
      await keycloakLogin()

      return { detail: "Login successful" }
    } catch {
      setLoading(false)

      return {
        detail: "Error al iniciar sesión con Keycloak",
      }
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      await keycloakLogout()
    } catch {
      toast.error("Keycloak logout error")
    }

    setUser(null)

    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
