import { Geist_Mono, Roboto } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme/themeProvider"
import LayoutClient from "./layout-client"
import { cn } from "@/lib/utils"
import { UserProvider } from "@/context/userContext"
import { ConnectionProvider } from "@/context/connectionContext"
import { Metadata } from "next"
import { AuthProvider } from "@/context/AuthProvider"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Intranet Produccion",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable
      )}
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <ConnectionProvider>
                <LayoutClient>{children}</LayoutClient>
              </ConnectionProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
