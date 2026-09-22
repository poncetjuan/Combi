import Link from "next/link";
import { ChefHat, MonitorPlay, ClipboardPlus } from "lucide-react";

const LINKS = [
  {
    href: "/cocina",
    title: "Cocina",
    description: "Dashboard para preparar y marcar pedidos.",
    icon: ChefHat,
    color: "#5BC2C9",
  },
  {
    href: "/pantalla",
    title: "Pantalla de clientes",
    description: "Vista pública para TV, en tiempo real.",
    icon: MonitorPlay,
    color: "#F07C71",
  },
  {
    href: "/admin",
    title: "Crear pedido de prueba",
    description: "Cargar pedidos de ejemplo sin usar Supabase.",
    icon: ClipboardPlus,
    color: "#94A3B8",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gray-50 px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-[#5BC2C9]">Com</span>
          <span className="text-[#F07C71]">bi</span>
        </h1>
        <p className="mt-2 text-gray-500">
          Kitchen Display System para tu negocio gastronómico.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {LINKS.map(({ href, title, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              <Icon size={22} />
            </span>
            <span className="text-lg font-bold text-gray-900">{title}</span>
            <span className="text-sm text-gray-500">{description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
