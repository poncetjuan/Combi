"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChefHat, BellRing } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Pedido } from "@/types/database.types";
import { PedidoCard } from "@/components/cocina/PedidoCard";

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPedidos() {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .neq("estado", "entregado")
        .order("created_at", { ascending: true });

      if (isMounted && !error && data) {
        setPedidos(data);
      }
      if (isMounted) setLoading(false);
    }

    fetchPedidos();

    const channel = supabase
      .channel("cocina-pedidos")
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
          const actualizado = payload.new as Pedido;
          setPedidos((prev) => {
            if (actualizado.estado === "entregado") {
              return prev.filter((p) => p.id !== actualizado.id);
            }
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
    };
  }, []);

  const enPreparacion = useMemo(
    () => pedidos.filter((p) => p.estado === "en_preparacion"),
    [pedidos]
  );
  const listos = useMemo(
    () => pedidos.filter((p) => p.estado === "listo"),
    [pedidos]
  );

  async function marcarListo(id: string) {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "listo" } : p))
    );
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: "listo" })
      .eq("id", id);
    if (error) console.error("Error al marcar listo:", error.message);
  }

  async function entregar(id: string) {
    setPedidos((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: "entregado" })
      .eq("id", id);
    if (error) console.error("Error al entregar:", error.message);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6 flex items-center gap-4">
        <Image src="/logo.png" alt="Combi" width={100} height={66} />
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <ChefHat size={28} className="text-amber-500" />
          <h1 className="text-2xl font-extrabold text-gray-900">Cocina</h1>
        </div>
      </header>

      {loading ? (
        <p className="text-lg text-gray-500">Cargando pedidos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-600">
              <ChefHat size={22} />
              En preparación ({enPreparacion.length})
            </h2>
            {enPreparacion.length === 0 ? (
              <p className="text-gray-400">No hay pedidos en preparación.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {enPreparacion.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    onMarcarListo={marcarListo}
                    onEntregar={entregar}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-emerald-600">
              <BellRing size={22} />
              Listos para entregar ({listos.length})
            </h2>
            {listos.length === 0 ? (
              <p className="text-gray-400">No hay pedidos listos.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {listos.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    onMarcarListo={marcarListo}
                    onEntregar={entregar}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
