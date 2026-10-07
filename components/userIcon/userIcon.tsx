"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { UserAvatar } from "@/components/userIcon/userAvatar"
import CambioPass from "@/components/userIcon/cambioPass"

import { useAuth } from "@/context/AuthProvider"
import { useAutorizacion } from "@/context/useAutorizacion"

const UserIcon = () => {
  const router = useRouter()
  const { user, logout, loading } = useAuth()

  const [open, setOpen] = useState(false)
  const [changePassOpen, setChangePassOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const displayName =
    `${user?.nombre ?? ""}${user?.nombre || user?.apellido ? " " : ""}${user?.apellido ?? ""}`.trim() ||
    "Usuario"

  const { tieneAccesoSubmodulo } = useAutorizacion()

  const canManageUsers = tieneAccesoSubmodulo("SUBMODULO_CONFIG_USUARIOS")

  const closeSession = async () => {
    try {
      setLoggingOut(true)
      await logout()
      setOpen(false)
    } finally {
      setLoggingOut(false)
    }
  }

  const configurarUsuarios = () => {
    if (!canManageUsers) {
      return (
        <Button
          className="w-full cursor-pointer border border-bluecremona bg-bluecremona/10 hover:bg-bluecremona/30"
          onClick={() => {
            setOpen(false)
            setTimeout(() => setChangePassOpen(true), 150)
          }}
        >
          <p className="font-medium text-bluecremona">Cambiar contraseña</p>
        </Button>
      )
    }

    if (canManageUsers) {
      return (
        <>
          <Button
            className="w-full cursor-pointer border border-greencremona bg-greencremona/10 hover:bg-greencremona/30"
            onClick={() => {
              router.push("/config_usuarios")
              setOpen(false)
            }}
          >
            <p className="font-medium text-greencremona">Gestionar accesos</p>
          </Button>
          <Button
            className="w-full cursor-pointer border border-bluecremona bg-bluecremona/10 hover:bg-bluecremona/30"
            onClick={() => {
              setOpen(false)
              setTimeout(() => setChangePassOpen(true), 150)
            }}
          >
            <p className="font-medium text-bluecremona">Cambiar contraseña</p>
          </Button>
        </>
      )
    }

    return null
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="cursor-pointer">
          <div className="group relative flex h-6.25 w-6.25 items-center justify-center ease-in-out">
            <div className="absolute inset-0 rounded-full bg-gray-400/0 transition-all group-hover:scale-150 group-hover:bg-gray-400/20" />
            <div className="transition-transform group-hover:scale-110">
              <UserAvatar
                nombre={user?.nombre ?? ""}
                apellido={user?.apellido ?? ""}
                loading={loading}
              />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="z-100">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Verificando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <p className="text-lg">{displayName}</p>
              {configurarUsuarios()}
              <Button
                className="w-full cursor-pointer bg-redcremona hover:bg-redcremona/70"
                onClick={closeSession}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="font-medium text-white">Cerrar sesión</p>
                )}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <CambioPass open={changePassOpen} onOpenChange={setChangePassOpen} />
    </>
  )
}

export default UserIcon
