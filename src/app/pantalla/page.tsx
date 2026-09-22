"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import type { Pedido } from "@/types/database.types";
import { PedidoTicket } from "@/components/pantalla/PedidoTicket";

const PULSE_DURATION_MS = 4000;

export default function PantallaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const pulseTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    let isMounted = true;
    const timeouts = pulseTimeouts.current;

    async function fetchPedidos() {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .neq("estado", "entregado")
        .order("created_at", { ascending: true });

      if (isMounted && !error && data) setPedidos(data);
    }

    fetchPedidos();

    const channel = supabase
      .channel("pantalla-pedidos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        (payload) => {
          const nuevo = payload.new as Pedido;
          if (nuevo.estado !== "entregado") {
            setPedidos((prev) => [...prev, nuevo]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos" },
        (payload) => {
          const anterior = payload.old as Partial<Pedido>;
          const actualizado = payload.new as Pedido;

          if (actualizado.estado === "entregado") {
            setPedidos((prev) => prev.filter((p) => p.id !== actualizado.id));
            return;
          }

          if (
            anterior?.estado === "en_preparacion" &&
            actualizado.estado === "listo"
          ) {
            setPulsingIds((prev) => new Set(prev).add(actualizado.id));

            const previousTimeout = timeouts.get(actualizado.id);
            if (previousTimeout) clearTimeout(previousTimeout);

            const timeout = setTimeout(() => {
              setPulsingIds((prev) => {
                const next = new Set(prev);
                next.delete(actualizado.id);
                return next;
              });
              timeouts.delete(actualizado.id);
            }, PULSE_DURATION_MS);
            timeouts.set(actualizado.id, timeout);
          }

          setPedidos((prev) => {
            const existe = prev.some((p) => p.id === actualizado.id);
            if (!existe) return [...prev, actualizado];
            return prev.map((p) => (p.id === actualizado.id ? actualizado : p));
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const enPreparacion = pedidos.filter((p) => p.estado === "en_preparacion");
  const listos = pedidos.filter((p) => p.estado === "listo");

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex shrink-0 flex-col items-center justify-center gap-1 py-2">
        <Image
          src="/logo.png"
          alt="Combi"
          width={1500}
          height={982}
          priority
          className="h-auto w-20 sm:w-28 md:w-[8.5rem] lg:w-40"
        />
        <p className="text-xl font-semibold uppercase tracking-widest text-gray-400 md:text-2xl">
          Tu pedido está en camino
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex w-1/2 flex-col overflow-hidden px-4 pb-6 md:px-8">
          <div className="mb-4 shrink-0 rounded-2xl bg-[#5BC2C9] py-1.5 shadow-lg">
            <h2 className="text-center text-[24px] font-black uppercase tracking-wide text-white sm:text-[28px]">
              En preparación
            </h2>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto md:gap-6">
            <AnimatePresence mode="popLayout">
              {enPreparacion.map((pedido) => (
                <PedidoTicket key={pedido.id} pedido={pedido} isPulsing={false} />
              ))}
            </AnimatePresence>
            {enPreparacion.length === 0 && (
              <p className="text-center text-xl font-medium text-gray-300">
                No hay pedidos en preparación
              </p>
            )}
          </div>
        </section>

        <section className="flex w-1/2 flex-col overflow-hidden bg-orange-50/30 px-4 pb-6 md:px-8">
          <div className="mb-4 shrink-0 rounded-2xl bg-[#F07C71] py-1.5 shadow-lg">
            <h2 className="text-center text-[24px] font-black uppercase tracking-wide text-white sm:text-[28px]">
              Listo para retirar
            </h2>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto md:gap-6">
            <AnimatePresence mode="popLayout">
              {listos.map((pedido) => (
                <PedidoTicket
                  key={pedido.id}
                  pedido={pedido}
                  isPulsing={pulsingIds.has(pedido.id)}
                />
              ))}
            </AnimatePresence>
            {listos.length === 0 && (
              <p className="text-center text-xl font-medium text-[#F07C71]/20">
                No hay pedidos listos
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
