import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function PUT(request: Request) {
  const token = getBearerTokenFromRequest(request)

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const nombreImagen = String(body?.nombre_imagen ?? "").trim()
    const payload = {
      id_ticket: Number(body?.id_ticket),
      nombre_imagen: nombreImagen,
      fecha_gasto: body?.fecha_gasto ?? null,
      monto: body?.monto !== undefined ? Number(body.monto) : null,
      id_medio_pago:
        body?.id_medio_pago !== undefined ? Number(body.id_medio_pago) : null,
      id_moneda: body?.id_moneda !== undefined ? Number(body.id_moneda) : null,
      id_concepto:
        body?.id_concepto !== undefined ? Number(body.id_concepto) : null,
    }

    if (
      !Number.isFinite(payload.id_ticket) ||
      !payload.id_ticket ||
      !payload.nombre_imagen ||
      !payload.fecha_gasto ||
      !Number.isFinite(payload.monto) ||
      !Number.isFinite(payload.id_medio_pago) ||
      !Number.isFinite(payload.id_moneda) ||
      !Number.isFinite(payload.id_concepto)
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para actualizar el recibo" },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/tickets/editar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      return NextResponse.json(
        {
          error: "Error al actualizar el ticket",
          detail: errorText || "No se pudo actualizar el recibo",
        },
        { status: response.status }
      )
    }

    const data = await response.text()
    return NextResponse.json(data ? JSON.parse(data) : { ok: true }, {
      status: 200,
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor" },
      { status: 500 }
    )
  }
}
