import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getExternalApiUrl } from "@/app/api/_utils/authApi"
import type { ModulosPersonales } from "@/types/types"

const EXTERNAL_API_URL = getExternalApiUrl("/modulos-personales/lista")

export async function GET(request: NextRequest) {
  if (!EXTERNAL_API_URL) {
    return NextResponse.json(
      { error: "Configuracion faltante: API_AUTH_URL" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const externalUrl = new URL(EXTERNAL_API_URL)

  const externalResponse = await fetch(externalUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await externalResponse.json().catch(() => null)
  const payload =
    data && typeof data === "object" && data !== null && "data" in data
      ? (data.data as unknown)
      : data

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error:
          data?.detail ??
          data?.message ??
          "Error al obtener la lista de módulos",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(payload as ModulosPersonales, {
    status: externalResponse.status,
  })
}
