import * as React from "react"
import { ChangeEvent } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LucideIcon, Check, ChevronDown } from "lucide-react"
import { Virtuoso } from "react-virtuoso"
import type { ArrayData, ItemCardProps, ObjectArray } from "@/types/types"

//---------------------------------------BOTONES---------------------------------------//
export function Boton({
  extraClass,
  placeholder,
  onClick,
  disabled = false,
}: {
  extraClass?: string
  placeholder?: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <Button
      className={`rounded border-2 ${extraClass} ${
        disabled ? "cursor-not-allowed! opacity-50" : "cursor-pointer"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {placeholder}
    </Button>
  )
}

export function BotonIcono({
  icono: Icono,
  buttonClass,
  iconClass,
  onClick,
  disabled = false,
}: {
  icono: LucideIcon
  buttonClass?: string
  iconClass?: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${buttonClass} ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      disabled={disabled}
    >
      <Icono className={iconClass} />
    </button>
  )
}

//---------------------------------------SELECTORES---------------------------------------//
function isObjectArray(data: ArrayData): data is ObjectArray {
  return data.length > 0 && typeof data[0] === "object"
}

type SelectorBaseProps = {
  placeholder: string
  data: ArrayData
  keyId?: string
  keyLabel?: string
  searchPlaceholder?: string
  extraClass?: string
  disabled?: boolean
}

type SelectorSimpleProps = {
  value?: string
  onValueChange?: (value: string) => void
  values?: never
  onValuesChange?: never
}

type SelectorMultipleProps = {
  values: (string | number)[]
  onValuesChange: (values: string[]) => void
  value?: never
  onValueChange?: never
}

type SelectorProps = SelectorBaseProps &
  (SelectorSimpleProps | SelectorMultipleProps)

const toObjectOptions = (data: ArrayData, keyLabel: string): ObjectArray => {
  if (isObjectArray(data)) {
    return data
  }

  return data.map((value) => ({
    id: String(value),
    [keyLabel]: String(value),
  })) as ObjectArray
}

export const Selector = React.memo(function Selector({
  placeholder,
  data,
  keyId = "id",
  keyLabel = "nombre",
  onValueChange,
  onValuesChange,
  extraClass,
  value,
  values,
  disabled = false,
}: SelectorProps) {
  const isMultiple =
    Array.isArray(values) && typeof onValuesChange === "function"

  if (isMultiple) {
    return (
      <SelectorMultiple
        placeholder={placeholder}
        data={toObjectOptions(data, keyLabel)}
        keyId={keyId}
        keyLabel={keyLabel}
        values={values}
        onValuesChange={onValuesChange}
        extraClass={extraClass}
        disabled={disabled}
      />
    )
  }

  return (
    <Select onValueChange={onValueChange} disabled={disabled} value={value}>
      <SelectTrigger
        className={`min-h-10 w-full rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm focus:border-background6 ${extraClass}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {isObjectArray(data)
            ? data.map((opcion) => {
                const opcionRecord = opcion as Record<string, unknown>
                return (
                  <SelectItem
                    key={String(opcionRecord[keyId])}
                    value={String(opcionRecord[keyId])}
                  >
                    {String(opcionRecord[keyLabel] ?? "")}
                  </SelectItem>
                )
              })
            : data.map((opcion) => (
                <SelectItem key={opcion} value={String(opcion)}>
                  {String(opcion)}
                </SelectItem>
              ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
})

export const SelectorConBusqueda = React.memo(function SelectorConBusqueda({
  placeholder,
  data,
  keyId = "id",
  keyLabel = "nombre",
  searchPlaceholder,
  onValueChange,
  onValuesChange,
  extraClass,
  value,
  values,
  disabled = false,
}: SelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const isMultiple =
    Array.isArray(values) && typeof onValuesChange === "function"
  const selectedValues = React.useMemo(
    () => values?.map(String) ?? [],
    [values]
  )

  const opcionesFiltradas = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!isObjectArray(data)) {
      return data.filter((opcion) =>
        String(opcion).toLowerCase().includes(query)
      )
    }

    if (!query) return data

    return data.filter((opcion) => {
      const opcionRecord = opcion as Record<string, unknown>
      const texto = [
        String(opcionRecord[keyId] ?? ""),
        String(opcionRecord[keyLabel] ?? ""),
        String(opcionRecord.nombre ?? ""),
        String(opcionRecord.apellido ?? ""),
        String(opcionRecord.legajo ?? ""),
      ]
        .join(" ")
        .toLowerCase()

      return texto.includes(query)
    })
  }, [data, keyId, keyLabel, search])

  const selectedLabel = React.useMemo(() => {
    const objectOptions = toObjectOptions(data, keyLabel)

    if (isMultiple) {
      if (selectedValues.length === 0) {
        return ""
      }

      return objectOptions
        .filter((opcion) => {
          const opcionRecord = opcion as Record<string, unknown>
          return selectedValues.includes(String(opcionRecord[keyId]))
        })
        .map((opcion) => {
          const opcionRecord = opcion as Record<string, unknown>
          return String(opcionRecord[keyLabel] ?? "")
        })
        .join(", ")
    }

    if (value === undefined || value === "") {
      return ""
    }

    const selected = objectOptions.find((opcion) => {
      const opcionRecord = opcion as Record<string, unknown>
      return String(opcionRecord[keyId]) === String(value)
    })

    return selected
      ? String((selected as Record<string, unknown>)[keyLabel] ?? "")
      : ""
  }, [data, isMultiple, keyId, keyLabel, selectedValues, value])

  const toggle = React.useCallback(
    (id: string) => {
      if (!isMultiple || !onValuesChange) {
        return
      }

      onValuesChange(
        selectedValues.includes(id)
          ? selectedValues.filter((value) => value !== id)
          : [...selectedValues, id]
      )
    },
    [isMultiple, onValuesChange, selectedValues]
  )

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch("")
        }
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`flex min-h-10 w-full items-center justify-between rounded border-2 border-background6 bg-background3 px-3 py-2 text-left text-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${extraClass ?? ""}`}
        >
          <span className={selectedLabel ? "" : "opacity-50"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-2"
        align="start"
      >
        <div className="flex flex-col gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              searchPlaceholder ?? `Buscar ${placeholder.toLowerCase()}...`
            }
            className="h-9"
            autoFocus
          />

          <div className="max-h-60 overflow-y-auto">
            {opcionesFiltradas.length > 0 ? (
              opcionesFiltradas.map((opcion, index) => {
                const opcionRecord = opcion as Record<string, unknown>
                const rawId = opcionRecord[keyId] ?? opcionRecord.id
                const id =
                  rawId !== undefined && rawId !== null && String(rawId) !== ""
                    ? String(rawId)
                    : `fallback-${index}`
                const label = String(opcionRecord[keyLabel] ?? "")

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (isMultiple) {
                        toggle(id)
                        return
                      }

                      onValueChange?.(id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors hover:bg-foreground/10 ${
                      isMultiple
                        ? selectedValues.includes(id)
                          ? "bg-foreground/5"
                          : ""
                        : value === id
                          ? "bg-foreground/5"
                          : ""
                    }`}
                  >
                    <span>{label}</span>
                    {isMultiple
                      ? selectedValues.includes(id) && (
                          <Check className="size-4" />
                        )
                      : value === id && <Check className="size-4" />}
                  </button>
                )
              })
            ) : (
              <p className="px-2 py-2 text-sm opacity-60">
                No se encontraron resultados
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

export const SelectorMultiple = React.memo(function SelectorMultiple({
  placeholder,
  data,
  keyId = "id",
  keyLabel = "nombre",
  values,
  onValuesChange,
  extraClass,
  disabled = false,
}: {
  placeholder: string
  data: ObjectArray
  keyId?: string
  keyLabel?: string
  extraClass?: string
  disabled?: boolean
  values: (string | number)[]
  onValuesChange: (values: string[]) => void
}) {
  if (data.length === 0) {
    return (
      <div
        className={`flex min-h-10 w-full items-center rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm opacity-70 ${extraClass ?? ""}`}
      >
        Filtros no disponibles
      </div>
    )
  }

  const toggle = (id: string) => {
    const stringValues = values.map(String)
    onValuesChange(
      stringValues.includes(id)
        ? stringValues.filter((v) => v !== id)
        : [...stringValues, id]
    )
  }

  const label =
    values.length === 0
      ? placeholder
      : data
          .filter((o) => {
            const optionRecord = o as Record<string, unknown>
            return values.map(String).includes(String(optionRecord[keyId]))
          })
          .map((o) => {
            const optionRecord = o as Record<string, unknown>
            return String(optionRecord[keyLabel] ?? "")
          })
          .join(", ")

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`flex min-h-10 w-full items-center justify-between rounded border-2 border-background6 bg-background3 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${extraClass ?? ""}`}
        >
          <span
            className={`truncate ${values.length === 0 ? "opacity-50" : ""}`}
          >
            {label}
          </span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-1"
        align="start"
      >
        {data.map((opcion) => {
          const optionRecord = opcion as Record<string, unknown>
          const id = String(optionRecord[keyId])
          const selected = values.map(String).includes(id)
          return (
            <div
              key={id}
              onClick={() => toggle(id)}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-foreground/10"
            >
              <div className="flex size-4 shrink-0 items-center justify-center rounded border border-foreground/30">
                {selected && <Check className="size-3" />}
              </div>
              <span>{String(optionRecord[keyLabel] ?? "")}</span>
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
})

//---------------------------------------TABLAS---------------------------------------//
export function Tabla({
  columns,
  data,
}: {
  columns: string[]
  data: Record<string, string>[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background3">
          {columns.map((column, index) => (
            <TableHead key={index}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>{row[column]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const TextScrollArea = React.memo(function TextScrollArea({
  tags,
  subtitles,
  selectedIndex,
  extraClass,
  placeholder,
  placeholderExtraClass,
  extras,
  onTagClick,
  withHover = true,
  withPointer = true,
  renderItem,
}: {
  tags: string[]
  subtitles?: string[]
  selectedIndex?: number
  extraClass?: string
  placeholder?: string
  placeholderExtraClass?: string
  extras?: (tag: string, index: number) => React.ReactNode
  onTagClick?: (tag: string, index: number) => void
  withHover?: boolean
  withPointer?: boolean
  renderItem?: (params: {
    tag: string
    subtitle?: string
    index: number
    isSelected: boolean
  }) => React.ReactNode
}) {
  return (
    <div className={`flex flex-col rounded ${extraClass || ""}`}>
      {placeholder && (
        <h4
          className={`mb-2 leading-none font-medium ${placeholderExtraClass || ""}`}
        >
          {placeholder}
        </h4>
      )}
      {tags.length === 0 ? (
        <div className="flex flex-1 items-center justify-center opacity-50">
          <p className="text-sm">No hay datos disponibles</p>
        </div>
      ) : (
        <Virtuoso
          style={{ flex: 1, minHeight: 0, height: "100%" }}
          totalCount={tags.length}
          components={{
            Footer: () => (
              <p className="py-4 text-center text-sm opacity-50">
                No hay más datos disponibles
              </p>
            ),
          }}
          itemContent={(index) => {
            const tag = tags[index]
            const subtitle = subtitles?.[index]
            const isSelected = selectedIndex === index
            const rowContent = renderItem ? (
              renderItem({ tag, subtitle, index, isSelected })
            ) : (
              <>
                <div
                  onClick={() => onTagClick?.(tag, index)}
                  className={`flex flex-1 py-2 ${withPointer ? "cursor-pointer" : ""}`}
                >
                  <div className="flex flex-col">
                    <span className={isSelected ? "font-semibold" : ""}>
                      {tag}
                    </span>
                    {subtitle && (
                      <span className="text-xs opacity-50">{subtitle}</span>
                    )}
                  </div>
                </div>
                <div>{extras?.(tag, index)}</div>
              </>
            )

            return (
              <div key={`${tag}-${index}`} className="mr-4">
                <span
                  className={`flex flex-row items-center rounded px-2 ${withHover ? "hover:bg-foreground/10" : ""} ${isSelected ? "bg-foreground/10" : ""}`}
                >
                  {rowContent}
                </span>
                {index < tags.length - 1 && <Separator className="my-2" />}
              </div>
            )
          }}
        />
      )}
    </div>
  )
})

//---------------------------------------INPUTS---------------------------------------//
export function Inputs({
  placeholder,
  type,
  disabled = false,
  value,
  onChange,
}: {
  placeholder: string
  type: string
  disabled?: boolean
  value?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <Input
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="min-h-10 w-full rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm focus:border-background6"
    />
  )
}
//---------------------------------------TEXTAREA---------------------------------------//
export function Textarea({
  placeholder,
  value = "",
  onChange = () => {},
}: {
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="min-h-24 w-full resize-none rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm focus:border-background6 focus:outline-none"
    />
  )
}

//---------------------------------------CAMPOS---------------------------------------//
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ChevronRightIcon } from "lucide-react"

export function ItemCard({
  title,
  description,
  icon,
  actions,
  href,
  variant = "outline",
  size = "default",
  className,
  children,
  showChevron = true,
}: ItemCardProps) {
  const content = (
    <>
      {icon && <ItemMedia>{icon}</ItemMedia>}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
        {children && <div className="mt-2">{children}</div>}
      </ItemContent>
      {actions ? (
        <ItemActions>{actions}</ItemActions>
      ) : href && showChevron ? (
        <ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions>
      ) : null}
    </>
  )

  const itemProps = { variant, size, className }

  if (href) {
    return (
      <Item {...itemProps} asChild>
        <a href={href}>{content}</a>
      </Item>
    )
  }

  return <Item {...itemProps}>{content}</Item>
}
