"use client"

import { useEffect, useMemo, useState } from "react"
import { mapViajantesFromSource } from "./mappers"
import type { MonedaOption, Viajante } from "./types"
import type { Viaje } from "@/types/types"

type Params = {
  open: boolean
  viaje: Viaje | null
  monedas: MonedaOption[]
  onLoadDetalle?: (id_viaje: number) => Promise<Record<string, unknown> | null>
}

export function useEditViajeDialog({
  open,
  viaje,
  monedas,
  onLoadDetalle,
}: Params) {
  const [viajantes, setViajantes] = useState<Viajante[]>(() =>
    mapViajantesFromSource(viaje?.viajantes)
  )
  const [selectedMonedaId, setSelectedMonedaId] = useState(() =>
    viaje ? String(viaje.id_moneda ?? "") : ""
  )
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    if (!open || !viaje) return
    let cancelled = false

    const syncViaje = async () => {
      const nextViajantes = mapViajantesFromSource(viaje.viajantes)
      const nextMoneda = viaje.id_moneda != null ? String(viaje.id_moneda) : ""

      if (!cancelled) {
        setViajantes(nextViajantes)
        setSelectedMonedaId(nextMoneda)
      }

      if (!onLoadDetalle) return

      const detalle = await onLoadDetalle(viaje.id_viaje)
      if (cancelled || !detalle || typeof detalle !== "object") return

      const detalleRecord = detalle as Record<string, unknown>
      const asignados = mapViajantesFromSource(
        detalleRecord.viajantes ?? detalle
      )

      if (!cancelled) {
        setViajantes(asignados.length > 0 ? asignados : nextViajantes)
      }

      const idMonedaDetalle =
        typeof detalleRecord.id_moneda === "number"
          ? String(detalleRecord.id_moneda)
          : typeof detalleRecord.id_moneda === "string"
            ? detalleRecord.id_moneda
            : null

      const nombreMonedaDetalle =
        typeof detalleRecord.moneda_nombre === "string"
          ? detalleRecord.moneda_nombre
          : typeof detalleRecord.moneda === "object" && detalleRecord.moneda
            ? String(
                (detalleRecord.moneda as Record<string, unknown>).nombre ?? ""
              )
            : ""

      const monedaEncontrada =
        idMonedaDetalle ??
        (nombreMonedaDetalle
          ? monedas.find(
              (moneda) =>
                (moneda.nombre ?? "").trim().toLowerCase() ===
                nombreMonedaDetalle.trim().toLowerCase()
            )?.id_moneda
          : null)

      if (!cancelled && monedaEncontrada) {
        setSelectedMonedaId(String(monedaEncontrada))
      }
    }

    void syncViaje()
    return () => {
      cancelled = true
    }
  }, [open, viaje, onLoadDetalle, monedas])

  const viajantesTexto = useMemo(
    () =>
      viajantes
        .map((v) =>
          `${v.nombre_usuario_viajante} ${v.apellido_usuario_viajante}`.trim()
        )
        .filter(Boolean)
        .join(", "),
    [viajantes]
  )

  const canSubmit = selectedMonedaId !== ""

  return {
    viajantes,
    setViajantes,
    selectedMonedaId,
    setSelectedMonedaId,
    selectorOpen,
    setSelectorOpen,
    viajantesTexto,
    canSubmit,
  }
}

export type UseEditViajeDialogReturn = ReturnType<typeof useEditViajeDialog>
