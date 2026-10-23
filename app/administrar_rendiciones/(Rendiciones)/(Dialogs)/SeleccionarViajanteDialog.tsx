"use client"

import { Boton } from "@/components/components"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Empleado } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  filtroInput: string
  onFiltroInputChange: (value: string) => void
  onAplicarFiltro: () => void
  onLimpiarFiltro: () => void
  filasPagina: Empleado[]
  empleadoSeleccionado: string
  onSeleccionarEmpleado: (id: string) => void
  paginaActual: number
  totalPaginas: number
  onPaginaAnterior: () => void
  onPaginaSiguiente: () => void
}

export function SeleccionarViajanteDialog({
  open,
  onOpenChange,
  loading,
  filtroInput,
  onFiltroInputChange,
  onAplicarFiltro,
  onLimpiarFiltro,
  filasPagina,
  empleadoSeleccionado,
  onSeleccionarEmpleado,
  paginaActual,
  totalPaginas,
  onPaginaAnterior,
  onPaginaSiguiente,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[80] bg-background2 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar viajante</DialogTitle>
          <DialogDescription>
            Elija el viajante para cargar sus viajes asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              value={filtroInput}
              onChange={(event) => onFiltroInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onAplicarFiltro()
              }}
              placeholder="Buscar por nombre, apellido o legajo"
              className="border border-background6 bg-background3"
            />
            <Boton
              onClick={onAplicarFiltro}
              extraClass="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
            >
              Filtrar
            </Boton>
            <Boton
              onClick={onLimpiarFiltro}
              extraClass="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
            >
              Limpiar
            </Boton>
          </div>

          <div className="overflow-hidden rounded border border-background6">
            <Table>
              <TableHeader className="bg-background2">
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Legajo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 bg-background3 text-center"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filasPagina.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 bg-background3 text-center"
                    >
                      No se encontraron empleados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filasPagina.map((empleado) => {
                    const seleccionado = empleado.id === empleadoSeleccionado
                    return (
                      <TableRow
                        key={empleado.id}
                        className={seleccionado ? "bg-bluecremona/5" : ""}
                      >
                        <TableCell className="w-10">
                          <Checkbox
                            checked={seleccionado}
                            onCheckedChange={() =>
                              onSeleccionarEmpleado(empleado.id)
                            }
                          />
                        </TableCell>
                        <TableCell>{empleado.nombre}</TableCell>
                        <TableCell>{empleado.apellido}</TableCell>
                        <TableCell>{empleado.legajo || "-"}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs opacity-70">
              Página {paginaActual + 1} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <Boton onClick={onPaginaAnterior} disabled={paginaActual === 0}>
                Anterior
              </Boton>
              <Boton
                onClick={onPaginaSiguiente}
                disabled={paginaActual >= totalPaginas - 1}
              >
                Siguiente
              </Boton>
            </div>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
