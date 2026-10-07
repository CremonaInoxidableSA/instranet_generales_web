"use client"

import * as React from "react"
import { cn } from "cn"

function Item({
  children,
  className,
  asChild,
  variant = "default",
  size = "default",
  ...props
}: {
  children?: React.ReactNode
  className?: string
  asChild?: boolean
  variant?: "default" | "outline" | "muted" | "ghost"
  size?: "default" | "sm" | "xs"
} & Record<string, unknown>) {
  const classNames = cn(
    "flex items-center gap-3 rounded p-3",
    variant === "outline" ? "border bg-background" : "",
    variant === "muted" ? "bg-muted/20" : "",
    size === "sm" ? "p-2 text-sm" : "text-base",
    size === "xs" ? "p-1 text-xs" : "",
    className
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement
    const childClass =
      (child.props && (child.props as { className?: string }).className) ||
      undefined
    return React.cloneElement(child, {
      className: cn(childClass, classNames),
      ...(props as Record<string, unknown>),
    } as unknown as Record<string, unknown>)
  }

  return (
    <div
      data-slot="item"
      className={classNames}
      {...(props as unknown as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  )
}

function ItemMedia({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="item-media"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ItemContent({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ItemTitle({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="item-title"
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ItemDescription({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="item-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ItemActions({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ml-2 flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions }
