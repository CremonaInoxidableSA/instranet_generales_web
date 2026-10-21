"use client"

import Image from "next/image"
import { ChangeEvent, useRef, useState } from "react"
import { Boton } from "@/components/components"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ArchivoSeleccionado = {
  id: string
  nombre: string
  preview: string | null
  file: File
}

type Props = {
  open: boolean
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onGuardar: (archivos: File[]) => Promise<void> | void
}

export function AgregarRecibosDialog({
  open,
  loading = false,
  onOpenChange,
  onGuardar,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [archivos, setArchivos] = useState<ArchivoSeleccionado[]>([])
  const [subiendo, setSubiendo] = useState(false)

  const agregarArchivos = (event: ChangeEvent<HTMLInputElement>) => {
    const nuevos = Array.from(event.target.files ?? [])

    if (!nuevos.length) {
      event.target.value = ""
      return
    }

    setArchivos((prev) => {
      const siguiente = [...prev]
      const ids = new Set(siguiente.map((item) => item.id))

      nuevos.forEach((file) => {
        const id = `${file.name}-${file.size}-${file.lastModified}`
        if (ids.has(id)) return
        ids.add(id)
        siguiente.push({
          id,
          nombre: file.name,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
          file,
        })
      })

      return siguiente
    })

    event.target.value = ""
  }

  const quitarArchivo = (id: string) => {
    setArchivos((prev) => {
      const item = prev.find((archivo) => archivo.id === id)
      if (item?.preview) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter((archivo) => archivo.id !== id)
    })
  }

  const limpiarArchivos = () => {
    archivos.forEach((archivo) => {
      if (archivo.preview) URL.revokeObjectURL(archivo.preview)
    })
    setArchivos([])
  }

  const cerrar = (nextOpen: boolean) => {
    if (!nextOpen) {
      limpiarArchivos()
    }
    onOpenChange(nextOpen)
  }

  const guardar = async () => {
    if (archivos.length === 0 || subiendo) return
    setSubiendo(true)
    try {
      await onGuardar(archivos.map((archivo) => archivo.file))
      limpiarArchivos()
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="z-100 bg-background2 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar recibos</DialogTitle>
          <DialogDescription>
            Seleccioná una o varias imágenes para cargarlas al viaje actual.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-wrap gap-3">
            {archivos.length === 0 ? (
              <div className="flex min-h-24 w-full items-center justify-center rounded border border-dashed border-background6 bg-background3/60 text-sm text-muted-foreground">
                Todavía no agregaste ningún recibo.
              </div>
            ) : (
              archivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className="relative flex w-[140px] flex-col gap-2 rounded border border-background6 bg-background3 p-2"
                >
                  <button
                    type="button"
                    onClick={() => quitarArchivo(archivo.id)}
                    aria-label={`Quitar ${archivo.nombre}`}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background2 text-sm text-foreground hover:bg-background6"
                  >
                    ×
                  </button>

                  {archivo.preview ? (
                    <Image
                      src={archivo.preview}
                      alt={archivo.nombre}
                      width={140}
                      height={96}
                      className="h-24 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded bg-background2 text-center text-[10px] font-medium text-muted-foreground uppercase">
                      Imagen
                    </div>
                  )}

                  <p className="truncate text-xs">{archivo.nombre}</p>
                </div>
              ))
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={agregarArchivos}
          />

          <div className="flex items-center justify-between gap-3">
            <Boton
              type="button"
              onClick={() => inputRef.current?.click()}
              extraClass="border-2 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
            >
              Agregar archivos
            </Boton>
            <span className="text-xs text-muted-foreground">
              {archivos.length} archivo(s) listo(s)
            </span>
          </div>
        </div>

        <DialogFooter>
          <Boton type="button" onClick={() => cerrar(false)}>
            Cancelar
          </Boton>
          <Boton
            type="button"
            disabled={loading || subiendo || archivos.length === 0}
            onClick={guardar}
            extraClass="border-2 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
          >
            {loading || subiendo ? "Subiendo..." : "Subir recibos"}
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
