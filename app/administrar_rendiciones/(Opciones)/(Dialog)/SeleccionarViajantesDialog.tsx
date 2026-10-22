"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
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
import { useSeleccionarViajantes } from "../useSeleccionarViajantes"
import type { Viajante } from "../types"

type Props = {
  initialSelected: Viajante[]
  onSave: (seleccionados: Viajante[]) => void
  onClose: () => void
}

export function SeleccionarViajantesDialog({
  initialSelected,
  onSave,
  onClose,
}: Props) {
  const s = useSeleccionarViajantes(initialSelected)

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Seleccionar viajantes</DialogTitle>
        <DialogDescription>
          Marque los empleados que viajan. La selección se mantiene aunque
          cambie de página o filtre.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={s.filtroInput}
            onChange={(e) => s.setFiltroInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") s.aplicarFiltro()
            }}
            placeholder="Filtrar por nombre, apellido o legajo"
            className="border border-background6 bg-background3"
          />
          <Button
            type="button"
            onClick={s.aplicarFiltro}
            className="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
          >
            Filtrar
          </Button>
          <Button
            type="button"
            onClick={s.limpiarFiltro}
            className="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
          >
            Limpiar
          </Button>
        </div>

        <div className="overflow-hidden rounded border">
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
              {s.loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 bg-background3 text-center"
                  >
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : s.filasPagina.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 bg-background3 text-center"
                  >
                    No hay empleados disponibles
                  </TableCell>
                </TableRow>
              ) : (
                s.filasPagina.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer odd:bg-background3 even:bg-background4 hover:bg-background5"
                    onClick={() => s.toggle(row)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={s.seleccion.has(row.id)}
                        onCheckedChange={() => s.toggle(row)}
                      />
                    </TableCell>
                    <TableCell>{row.nombre}</TableCell>
                    <TableCell>{row.apellido}</TableCell>
                    <TableCell>{row.legajo || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-60">
            {s.seleccionadosCount} viajante(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={s.paginaActual <= 0}
              onClick={s.anterior}
            >
              Anterior
            </Button>
            <span className="min-w-20 text-center text-sm">
              Página {s.paginaActual + 1} de {s.totalPaginas}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={s.paginaActual >= s.totalPaginas - 1}
              onClick={s.siguiente}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={() => {
            onSave(s.getSeleccionados())
            onClose()
          }}
        >
          Guardar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
