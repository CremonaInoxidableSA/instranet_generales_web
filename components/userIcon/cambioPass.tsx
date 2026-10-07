"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthProvider"
import { fetchWithConnectionCheck } from "@/lib/connectionManager"
import type { CambioPassProps } from "@/types/types"

const CambioPass = ({ open, onOpenChange }: CambioPassProps) => {
  const [form, setForm] = useState({
    new_password: "",
    new_password_confirmation: "",
  })

  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()

  const handleChange = (
    key: "new_password" | "new_password_confirmation",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleClose = () => {
    if (loading) return

    setForm({
      new_password: "",
      new_password_confirmation: "",
    })
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!form.new_password) {
      toast.error("Ingrese la nueva contraseña")
      return
    }

    if (!form.new_password_confirmation) {
      toast.error("Confirme la nueva contraseña")
      return
    }

    if (form.new_password !== form.new_password_confirmation) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (form.new_password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetchWithConnectionCheck(
        "/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: form.new_password,
            password_confirmation: form.new_password_confirmation,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.error ?? "Error al cambiar la contraseña")
        return
      }

      toast.success("Contraseña actualizada correctamente")
      handleClose()
      await logout()
    } catch {
      toast.error("Error de comunicación con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="z-100 bg-background2 sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Complete los datos para cambiar la contraseña. Esta debe tener al
            menos 8 caracteres.
            <br />
            <br />
            Al cambiar la contraseña se cerrará la sesión actual y deberá
            iniciar sesión nuevamente con la nueva contraseña.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="new_password">Nueva contraseña</Label>

            <Input
              id="new_password"
              type="password"
              value={form.new_password}
              onChange={(e) => handleChange("new_password", e.target.value)}
              placeholder="Ingrese su nueva contraseña"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new_password_confirmation">
              Confirmar nueva contraseña
            </Label>

            <Input
              id="new_password_confirmation"
              type="password"
              value={form.new_password_confirmation}
              onChange={(e) =>
                handleChange("new_password_confirmation", e.target.value)
              }
              placeholder="Confirme su nueva contraseña"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>Cambiando...</span>
              </div>
            ) : (
              "Cambiar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CambioPass
