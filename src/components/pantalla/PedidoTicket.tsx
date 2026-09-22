"use client";

import { motion } from "framer-motion";
import type { Pedido } from "@/types/database.types";
import { cn } from "@/lib/utils";

type PedidoTicketProps = {
  pedido: Pedido;
  isPulsing: boolean;
};

export function PedidoTicket({ pedido, isPulsing }: PedidoTicketProps) {
  const isListo = pedido.estado === "listo";

  return (
    <motion.div
      layoutId={pedido.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={cn(
        "flex w-full shrink-0 items-center justify-center rounded-3xl py-6 shadow-sm md:py-8 lg:py-10",
        isListo ? "bg-[#F07C71] shadow-md" : "bg-gray-100",
        isPulsing && "animate-glow"
      )}
    >
      <span
        className={cn(
          "text-7xl leading-none tracking-tight md:text-8xl",
          isListo ? "font-black text-white" : "font-bold text-gray-800"
        )}
      >
        {pedido.numero_ticket}
      </span>
    </motion.div>
  );
}
