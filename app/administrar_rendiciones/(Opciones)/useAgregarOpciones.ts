"use client"

import { useMemo, useState } from "react"
import {
  useConceptos,
  useMediosPago,
  useMonedas,
  useViajes,
} from "@/context/dataGeneralContext"
import type { Viaje } from "@/types/types"
import type {
  CreateEntityType,
  CreatePayload,
  EditViajePayload,
  MonedaOption,
  ToggleListItem,
} from "./types"

export function useAgregarOpciones() {
  const {
    monedas,
    refresh: refreshMonedas,
    habilitarMoneda,
    deshabilitarMoneda,
    crearMoneda,
  } = useMonedas()
  const {
    viajes,
    refresh: refreshViajes,
    habilitarViaje,
    deshabilitarViaje,
    crearViaje,
    editarViajantes,
    editarMoneda,
    obtenerDetalleViaje,
  } = useViajes()
  const {
    mediosPago,
    refresh: refreshMediosPago,
    habilitarMedioPago,
    deshabilitarMedioPago,
    crearMedioPago,
  } = useMediosPago()
  const {
    conceptos,
    refresh: refreshConceptos,
    habilitarConcepto,
    deshabilitarConcepto,
    crearConcepto,
  } = useConceptos()

  const [createOpen, setCreateOpen] = useState(false)
  const [createEntity, setCreateEntity] = useState<CreateEntityType | null>(
    null
  )
  const [editViaje, setEditViaje] = useState<Viaje | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  // ------------------- DERIVED: LISTAS -------------------
  const monedaItems: ToggleListItem[] = useMemo(
    () =>
      monedas.map((moneda) => ({
        id: moneda.id_moneda,
        nombre: moneda.nombre,
        estado: moneda.estado,
      })),
    [monedas]
  )

  const viajeItems: ToggleListItem[] = useMemo(
    () =>
      viajes.map((viaje) => ({
        id: viaje.id_viaje,
        nombre: viaje.nombre,
        estado: viaje.estado,
      })),
    [viajes]
  )

  const medioPagoItems: ToggleListItem[] = useMemo(
    () =>
      mediosPago.map((medio) => ({
        id: medio.id_medio_pago,
        nombre: medio.nombre,
        estado: medio.estado,
      })),
    [mediosPago]
  )

  const motivoItems: ToggleListItem[] = useMemo(
    () =>
      conceptos.map((concepto) => ({
        id: concepto.id_concepto,
        nombre: concepto.nombre,
        estado: concepto.estado,
      })),
    [conceptos]
  )

  // Memoizado para evitar reruns del effect del dialog de edición
  const monedaOptions: MonedaOption[] = useMemo(
    () => monedas.map((m) => ({ id_moneda: m.id_moneda, nombre: m.nombre })),
    [monedas]
  )

  // ------------------- ACCIONES DE TOGGLE -------------------
  const toggleMoneda = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarMoneda(item.id)
    } else {
      await habilitarMoneda(item.id)
    }
    await refreshMonedas()
  }

  const toggleViaje = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarViaje(item.id)
    } else {
      await habilitarViaje(item.id)
    }
    await refreshViajes()
  }

  const toggleViajeInDialog = async (item: ToggleListItem) => {
    const actionSucceeded = item.estado
      ? await deshabilitarViaje(item.id)
      : await habilitarViaje(item.id)

    if (!actionSucceeded) {
      setEditOpen(false)
      setEditViaje(null)
      return false
    }

    setEditViaje((currentViaje) => {
      if (!currentViaje || currentViaje.id_viaje !== item.id)
        return currentViaje
      return { ...currentViaje, estado: item.estado ? false : true }
    })

    await refreshViajes()
    return true
  }

  const toggleMedioPago = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarMedioPago(item.id)
    } else {
      await habilitarMedioPago(item.id)
    }
    await refreshMediosPago()
  }

  const toggleConcepto = async (item: ToggleListItem) => {
    if (item.estado) {
      await deshabilitarConcepto(item.id)
    } else {
      await habilitarConcepto(item.id)
    }
    await refreshConceptos()
  }

  // ------------------- ACCIONES DE CREACIÓN -------------------
  const handleCreateSubmit = async (payload: CreatePayload) => {
    if (!createEntity) return
    switch (createEntity) {
      case "moneda":
        await crearMoneda(payload.nombre)
        break
      case "viaje":
        if (payload.id_moneda === undefined) return
        await crearViaje(payload.nombre, payload.id_moneda)
        break
      case "medioPago":
        await crearMedioPago(payload.nombre)
        break
      case "concepto":
        await crearConcepto(payload.nombre)
        break
    }
  }

  const abrirCreacion = (entity: CreateEntityType) => {
    setCreateEntity(entity)
    setCreateOpen(true)
  }

  const cerrarCreacion = () => setCreateOpen(false)

  // ------------------- ACCIONES DE EDICIÓN -------------------
  const abrirEdicionViaje = (item: ToggleListItem) => {
    const viajeSeleccionado = viajes.find((v) => v.id_viaje === item.id)
    if (!viajeSeleccionado) return
    setEditViaje(viajeSeleccionado)
    setEditOpen(true)
  }

  const cerrarEdicionViaje = () => {
    setEditOpen(false)
    setEditViaje(null)
  }

  const handleEditViajeSubmit = async (payload: EditViajePayload) => {
    await editarViajantes({
      id_viaje: payload.id_viaje,
      viajantes: payload.viajantes,
    })
    await editarMoneda({
      id_viaje: payload.id_viaje,
      id_moneda: payload.id_moneda,
    })
    await refreshViajes()
  }

  return {
    // state dialogs
    createOpen,
    createEntity,
    editOpen,
    editViaje,

    // derived
    monedaItems,
    viajeItems,
    medioPagoItems,
    motivoItems,
    monedaOptions,

    // toggles
    toggleMoneda,
    toggleViaje,
    toggleMedioPago,
    toggleConcepto,
    toggleViajeInDialog,

    // create
    abrirCreacion,
    cerrarCreacion,
    handleCreateSubmit,

    // edit
    abrirEdicionViaje,
    cerrarEdicionViaje,
    handleEditViajeSubmit,
    obtenerDetalleViaje,
  }
}

export type UseAgregarOpcionesReturn = ReturnType<typeof useAgregarOpciones>
