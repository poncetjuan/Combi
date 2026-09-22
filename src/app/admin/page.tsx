"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Send, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ItemDraft = {
  nombre: string;
  cantidad: number;
};

type Feedback =
  | { type: "success"; ticket: string }
  | { type: "error"; message: string }
  | null;

const EMPTY_ITEM: ItemDraft = { nombre: "", cantidad: 1 };

export default function AdminPage() {
  const [numeroTicket, setNumeroTicket] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const itemsValidos = items
      .map((item) => ({ nombre: item.nombre.trim(), cantidad: item.cantidad }))
      .filter((item) => item.nombre.length > 0 && item.cantidad > 0);

    if (!numeroTicket.trim()) {
      setFeedback({ type: "error", message: "Ingresá un número de ticket." });
      return;
    }
    if (itemsValidos.length === 0) {
      setFeedback({
        type: "error",
        message: "Agregá al menos un producto con nombre y cantidad.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/webhook/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_ticket: numeroTicket.trim(),
          items: itemsValidos,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error ?? "No se pudo crear el pedido.",
        });
        return;
      }

      setFeedback({ type: "success", ticket: data.pedido.numero_ticket });
      setNumeroTicket("");
      setItems([{ ...EMPTY_ITEM }]);
    } catch {
      setFeedback({ type: "error", message: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Image
          src="/logo.png"
          alt="Combi"
          width={100}
          height={66}
          className="mb-3"
        />
        <h1 className="text-2xl font-extrabold text-gray-900">
          Crear pedido de prueba
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Simula un pedido tal como llegaría desde el sistema de facturación.
          Aparece al instante en{" "}
          <a href="/cocina" className="underline">
            /cocina
          </a>{" "}
          y{" "}
          <a href="/pantalla" className="underline">
            /pantalla
          </a>
          .
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="numero_ticket"
              className="block text-sm font-semibold text-gray-700"
            >
              Número de ticket
            </label>
            <input
              id="numero_ticket"
              type="text"
              value={numeroTicket}
              onChange={(e) => setNumeroTicket(e.target.value)}
              placeholder="A45"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-lg font-semibold focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="block text-sm font-semibold text-gray-700">
                Productos
              </span>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <Plus size={16} />
                Agregar producto
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) =>
                      updateItem(index, { nombre: e.target.value })
                    }
                    placeholder="Nombre del producto"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) =>
                      updateItem(index, {
                        cantidad: Number(e.target.value) || 1,
                      })
                    }
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-gray-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {feedback && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium",
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              )}
            >
              {feedback.type === "success" ? (
                <>
                  <CheckCircle2 size={18} />
                  Pedido {feedback.ticket} creado correctamente.
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  {feedback.message}
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-lg font-bold text-white transition active:scale-95 disabled:opacity-50"
          >
            <Send size={20} />
            {loading ? "Creando..." : "Crear pedido"}
          </button>
        </form>
      </div>
    </main>
  );
}
