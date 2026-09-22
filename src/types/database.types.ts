export type EstadoPedido = "en_preparacion" | "listo" | "entregado";

export type PedidoItem = {
  nombre: string;
  cantidad: number;
};

export type Pedido = {
  id: string;
  numero_ticket: string;
  items: PedidoItem[];
  estado: EstadoPedido;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      pedidos: {
        Row: Pedido;
        Insert: Partial<Pedido> & Pick<Pedido, "numero_ticket" | "items">;
        Update: Partial<Pedido>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
