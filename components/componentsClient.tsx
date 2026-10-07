"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { PencilLine } from "lucide-react"
import { BotonIcono } from "@/components/components"

import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

//---------------------------------------DATE PICKER---------------------------------------//
export function DateRangePicker({
  placeholder,
  value,
  onValueChange,
}: {
  placeholder?: string
  value?: DateRange
  onValueChange?: (date: DateRange | undefined) => void
}) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }
  )

  const date = value ?? internalDate
  const setDate = onValueChange ?? setInternalDate

  return (
    <Field className="flex h-full w-full">
      <Popover>
        <PopoverTrigger className="flex h-full" asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="min-h-10 w-full justify-start rounded border-2 border-background6 bg-background3 px-3 py-2 font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

//---------------------------------------TABLAS---------------------------------------//
export function TablaEdicion({
  columns,
  data,
  onClickEdit,
}: {
  columns: string[]
  data: Record<string, string>[]
  onClickEdit: (row: Record<string, string>) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background3">
          {columns.map((column, index) => (
            <TableHead key={index}>{column}</TableHead>
          ))}
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex} className="group">
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>{row[column]}</TableCell>
            ))}
            <TableCell className="flex items-center justify-end gap-2">
              <BotonIcono icono={PencilLine} onClick={() => onClickEdit(row)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

//---------------------------------------DIALOGS---------------------------------------//
export function DialogTemplate({
  title,
  description,
  fields,
  open,
  onOpenChange,
  dialogFooter,
}: {
  title: string
  description?: string | React.ReactNode
  fields: React.ReactNode
  open: boolean
  dialogFooter?: React.ReactNode
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogContent
          className="sm:max-w-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex max-h-[60vh] w-full flex-col gap-4 overflow-y-auto pr-1">
            {fields}
          </div>
          {dialogFooter && <DialogFooter>{dialogFooter}</DialogFooter>}
        </DialogContent>
      </form>
    </Dialog>
  )
}

export function AlertDialogTemplate({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  cancelDisabled = false,
  confirmDisabled = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string | React.ReactNode
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  cancelDisabled?: boolean
  confirmDisabled?: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={confirmDisabled}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
