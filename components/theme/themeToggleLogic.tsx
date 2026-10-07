"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const THEMES = ["light", "dark", "pinky"] as const

type ThemeName = (typeof THEMES)[number]

export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const currentTheme = mounted
    ? ((theme as ThemeName | undefined) ?? "light")
    : null

  const toggleTheme = () => {
    const current = (theme as ThemeName | undefined) ?? "light"
    const currentIndex = THEMES.indexOf(current)
    const nextTheme =
      currentIndex === -1
        ? THEMES[0]
        : THEMES[(currentIndex + 1) % THEMES.length]
    setTheme(nextTheme)
  }

  return {
    theme: currentTheme,
    toggleTheme,
  }
}
