import * as React from "react"
import { ChangeEvent } from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"

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
import { LucideIcon } from "lucide-react"
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
  return Array.isArray(data) && data.length > 0 && typeof data[0] === "object"
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

type SelectorOption = {
  id: string
  label: string
}

const toSelectorOptions = (
  data: ArrayData,
  keyId: string,
  keyLabel: string
): SelectorOption[] => {
  if (isObjectArray(data)) {
    return data.map((opcion, index) => {
      const record = opcion as Record<string, unknown>
      const rawId = record[keyId] ?? record.id
      const id =
        rawId !== undefined && rawId !== null && String(rawId) !== ""
          ? String(rawId)
          : `fallback-${index}`

      const label = String(
        record[keyLabel] ?? record.nombre ?? record.label ?? ""
      )

      return { id, label }
    })
  }

  return data.map((value, index) => {
    const normalizedValue = value ?? ""
    const id =
      normalizedValue === "" ? `fallback-${index}` : String(normalizedValue)

    return { id, label: String(normalizedValue) }
  })
}

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
  const isMultiple =
    Array.isArray(values) && typeof onValuesChange === "function"
  const selectedValues = React.useMemo(
    () => values?.map(String) ?? [],
    [values]
  )
  const options = React.useMemo(
    () => toSelectorOptions(data, keyId, keyLabel),
    [data, keyId, keyLabel]
  )

  const selectedOption = React.useMemo(() => {
    if (isMultiple || value === undefined || value === "") {
      return null
    }

    return options.find((option) => option.id === String(value)) ?? null
  }, [isMultiple, options, value])

  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedValues.includes(option.id)),
    [options, selectedValues]
  )

  const handleSingleValue = React.useCallback(
    (nextValue: SelectorOption | null) => {
      onValueChange?.(nextValue ? nextValue.id : "")
    },
    [onValueChange]
  )

  const handleMultipleValues = React.useCallback(
    (nextValues: SelectorOption[] | null) => {
      onValuesChange?.((nextValues ?? []).map((option) => option.id))
    },
    [onValuesChange]
  )

  if (isMultiple) {
    return (
      <Combobox
        multiple
        items={options}
        value={selectedOptions}
        onValueChange={handleMultipleValues}
        disabled={disabled}
        isItemEqualToValue={(a: SelectorOption, b: SelectorOption) =>
          a.id === b.id
        }
      >
        <ComboboxChips
          className={`min-h-10 w-full rounded border-2 border-background6 bg-background3 px-2 py-1 text-sm transition-colors focus-within:border-background6 ${extraClass ?? ""}`}
        >
          <ComboboxValue>
            {() => (
              <>
                {selectedOptions.map((option) => (
                  <ComboboxChip key={option.id}>{option.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={
                    searchPlaceholder ??
                    `Buscar ${placeholder.toLowerCase()}...`
                  }
                  className="text-sm"
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxInput
            showTrigger={false}
            placeholder={
              searchPlaceholder ?? `Buscar ${placeholder.toLowerCase()}...`
            }
            className="h-9"
            disabled={disabled}
          />
          <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
          <ComboboxList>
            {(item: SelectorOption) => (
              <ComboboxItem key={item.id} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  }

  return (
    <Combobox
      items={options}
      value={selectedOption}
      onValueChange={handleSingleValue}
      disabled={disabled}
      isItemEqualToValue={(a: SelectorOption, b: SelectorOption) =>
        a.id === b.id
      }
    >
      <ComboboxTrigger
        className={`flex min-h-10 w-full items-center justify-between rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm font-normal shadow-none hover:bg-background3 focus:border-background6 ${extraClass ?? ""}`}
        disabled={disabled}
      >
        <span
          className={`truncate text-left ${
            selectedOption ? "text-foreground" : "opacity-60"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder={searchPlaceholder ?? "Buscar..."}
          className="h-9"
          disabled={disabled}
        />
        <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectorOption) => (
            <ComboboxItem key={item.id} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
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
  const options = React.useMemo(
    () => toSelectorOptions(data, keyId, keyLabel),
    [data, keyId, keyLabel]
  )
  const selectedValues = React.useMemo(() => values.map(String), [values])
  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedValues.includes(option.id)),
    [options, selectedValues]
  )

  return (
    <Combobox
      multiple
      items={options}
      value={selectedOptions}
      onValueChange={(nextValues: SelectorOption[] | null) => {
        onValuesChange((nextValues ?? []).map((option) => option.id))
      }}
      disabled={disabled}
    >
      <ComboboxChips
        className={`min-h-10 w-full rounded border-2 border-background6 bg-background3 px-2 py-1 text-sm transition-colors focus-within:border-background6 ${extraClass ?? ""}`}
      >
        <ComboboxValue>
          {() => (
            <>
              {selectedOptions.map((option) => (
                <ComboboxChip key={option.id}>{option.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={selectedOptions.length === 0 ? placeholder : ""}
                className="text-sm"
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder={`Buscar ${placeholder.toLowerCase()}...`}
          className="h-9"
          disabled={disabled}
        />
        <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
        <ComboboxList>
          {(item: SelectorOption) => (
            <ComboboxItem key={item.id} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
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
