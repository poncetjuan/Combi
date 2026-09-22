import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/utils/supabase/service";

type PedidoItem = {
  nombre: string;
  cantidad: number;
  [key: string]: unknown;
};

type PedidoPayload = {
  numero_ticket: string;
  items: PedidoItem[];
};

export async function POST(request: NextRequest) {
  let body: PedidoPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { numero_ticket, items } = body;

  if (typeof numero_ticket !== "string" || !numero_ticket.trim()) {
    return NextResponse.json(
      { error: "numero_ticket es requerido" },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "items es requerido y debe ser un array no vacío" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseService
    .from("pedidos")
    .insert({
      numero_ticket,
      items,
      estado: "en_preparacion",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pedido: data }, { status: 200 });
}
