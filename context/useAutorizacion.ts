"use client"

import { useCallback, useMemo } from "react"
import { useAuth } from "@/context/AuthProvider"
import { AUTORIZACIONES, type Autorizacion } from "@/lib/permisos"
import type { NombreConNombre } from "@/types/types"

const toNombre = (value: NombreConNombre) => {
  if (typeof value === "string") {
    return value
  }

  return value?.nombre ?? ""
}

export function useAutorizacion() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () =>
      new Set(
        (user?.permisos ?? [])
          .map((permiso) => toNombre(permiso))
          .filter(Boolean)
      ),
    [user?.permisos]
  )

  const submodulosSet = useMemo(
    () =>
      new Set(
        (user?.submodulos ?? [])
          .map((submodulo) => toNombre(submodulo))
          .filter(Boolean)
      ),
    [user?.submodulos]
  )

  const tienePermiso = useCallback(
    (nombre: Autorizacion) => permisosSet.has(nombre),
    [permisosSet]
  )
  const tieneAlgunPermiso = useCallback(
    (nombres: Autorizacion[]) =>
      nombres.some((nombre) => permisosSet.has(nombre)),
    [permisosSet]
  )

  const tieneAccesoSubmodulo = useCallback(
    (nombre: string) => submodulosSet.has(nombre),
    [submodulosSet]
  )

  const autorizacion = useMemo(
    () => ({
      usuarios: {
        consultar: tienePermiso(AUTORIZACIONES.CONSULTAR_USUARIOS),
        crear: tienePermiso(AUTORIZACIONES.CREAR_USUARIOS),
        editar: tienePermiso(AUTORIZACIONES.EDITAR_USUARIOS),
        eliminar: tienePermiso(AUTORIZACIONES.ELIMINAR_USUARIOS),
        deshabilitar: tienePermiso(AUTORIZACIONES.DESHABILITAR_USUARIOS),
        habilitar: tienePermiso(AUTORIZACIONES.HABILITAR_USUARIOS),
        cambiarContrasena: tienePermiso(AUTORIZACIONES.CAMBIAR_CONTRASENA),
      },
      grupos: {
        consultar: tienePermiso(AUTORIZACIONES.CONSULTAR_GRUPOS),
        crear: tienePermiso(AUTORIZACIONES.CREAR_GRUPOS),
        editar: tienePermiso(AUTORIZACIONES.EDITAR_GRUPOS),
        eliminar: tienePermiso(AUTORIZACIONES.ELIMINAR_GRUPOS),
      },
      permisos: {
        consultar: tienePermiso(AUTORIZACIONES.CONSULTAR_PERMISOS),
        crear: tienePermiso(AUTORIZACIONES.CREAR_PERMISOS),
        editar: tienePermiso(AUTORIZACIONES.EDITAR_PERMISOS),
        eliminar: tienePermiso(AUTORIZACIONES.ELIMINAR_PERMISOS),
      },
      modulos: {
        consultar: tienePermiso(AUTORIZACIONES.CONSULTAR_MODULOS),
        crear: tienePermiso(AUTORIZACIONES.CREAR_MODULOS),
        editar: tienePermiso(AUTORIZACIONES.EDITAR_MODULOS),
        eliminar: tienePermiso(AUTORIZACIONES.ELIMINAR_MODULOS),
        deshabilitar: tienePermiso(AUTORIZACIONES.DESHABILITAR_MODULOS),
        habilitar: tienePermiso(AUTORIZACIONES.HABILITAR_MODULOS),
      },
      submodulos: {
        consultar: tienePermiso(AUTORIZACIONES.CONSULTAR_SUBMODULOS),
        crear: tienePermiso(AUTORIZACIONES.CREAR_SUBMODULOS),
        editar: tienePermiso(AUTORIZACIONES.EDITAR_SUBMODULOS),
        eliminar: tienePermiso(AUTORIZACIONES.ELIMINAR_SUBMODULOS),
        deshabilitar: tienePermiso(AUTORIZACIONES.DESHABILITAR_SUBMODULOS),
        habilitar: tienePermiso(AUTORIZACIONES.HABILITAR_SUBMODULOS),
        tarea: tienePermiso(AUTORIZACIONES.SUBMODULO_TAREAS),
        operarios: tienePermiso(AUTORIZACIONES.SUBMODULO_OPERARIOS),
        productos: tienePermiso(AUTORIZACIONES.SUBMODULO_PRODUCTOS),
        monitoreo: tienePermiso(AUTORIZACIONES.SUBMODULO_MONITOREO),
        backup: tienePermiso(AUTORIZACIONES.SUBMODULO_BACKUP),
        panel: tienePermiso(AUTORIZACIONES.SUBMODULO_PANEL),
      },
      productos: {
        editar: tienePermiso(AUTORIZACIONES.PRODUCTOS_EDITAR),
        eliminar: tienePermiso(AUTORIZACIONES.PRODUCTOS_ELIMINAR),
        duplicar: tienePermiso(AUTORIZACIONES.PRODUCTOS_DUPLICAR),
      },
    }),
    [tienePermiso]
  )

  return useMemo(
    () => ({
      tienePermiso,
      tieneAlgunPermiso,
      tieneAccesoSubmodulo,
      autorizacion,
    }),
    [tienePermiso, tieneAlgunPermiso, tieneAccesoSubmodulo, autorizacion]
  )
}
