"use client"

import { Moon, Rose, SunMedium } from "lucide-react"
import { type LucideIcon } from "lucide-react"

import { useThemeToggle } from "./themeToggleLogic"

const themeIcons: Record<string, LucideIcon> = {
  light: SunMedium,
  dark: Moon,
  pinky: Rose,
}

const FallbackIcon = SunMedium

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeToggle()

  const IconComponent = theme
    ? (themeIcons[theme] ?? FallbackIcon)
    : FallbackIcon

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="group relative flex h-6 w-6 items-center justify-center transition-all duration-200"
    >
      <div className="pointer-events-none absolute inset-0 rounded-md transition-transform duration-200 group-hover:scale-150" />

      <IconComponent className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
    </button>
  )
}
