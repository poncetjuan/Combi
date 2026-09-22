"use client";

import { Clock, CheckCircle2, PackageCheck } from "lucide-react";
import type { Pedido } from "@/types/database.types";
import { useElapsedTime } from "@/lib/useElapsedTime";
import { cn } from "@/lib/utils";

type PedidoCardProps = {
  pedido: Pedido;
  onMarcarListo: (id: string) => void;
  onEntregar: (id: string) => void;
};

export function PedidoCard({ pedido, onMarcarListo, onEntregar }: PedidoCardProps) {
  const elapsed = useElapsedTime(pedido.created_at);
  const isListo = pedido.estado === "listo";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border-4 bg-white p-5 shadow-lg transition-colors",
        isListo ? "border-emerald-500 bg-emerald-50" : "border-amber-400"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-4xl font-black tracking-tight text-gray-900">
          {pedido.numero_ticket}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
          <Clock size={16} />
          {elapsed}
        </span>
      </div>

      <ul className="flex-1 space-y-1.5">
        {pedido.items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1.5 text-lg text-gray-800"
          >
            <span>{item.nombre}</span>
            <span className="font-bold">x{item.cantidad}</span>
          </li>
        ))}
      </ul>

      {isListo ? (
        <button
          onClick={() => onEntregar(pedido.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-4 text-lg font-bold text-white transition active:scale-95 active:bg-gray-800"
        >
          <PackageCheck size={22} />
          Entregar
        </button>
      ) : (
        <button
          onClick={() => onMarcarListo(pedido.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-5 text-xl font-bold text-white transition active:scale-95 active:bg-emerald-600"
        >
          <CheckCircle2 size={26} />
          Marcar Listo
        </button>
      )}
    </div>
  );
}
