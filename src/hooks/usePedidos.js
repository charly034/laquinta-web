import { useEffect, useState } from "react";
import { fetchPedidos, updatePedidoStatus } from "../services/pedidosApi";

export function usePedidos({ autoRefresh = true, intervalMs = 15000 } = {}) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh({ signal } = {}) {
    try {
      setError("");
      const data = await fetchPedidos({ signal });
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.name !== "AbortError") {
        console.error("fetchPedidos error:", e);
        setError(e?.message || "No se pudieron cargar los pedidos.");
      }
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    refresh({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    let controller = new AbortController();

    const tick = () => {
      controller.abort();
      controller = new AbortController();
      refresh({ signal: controller.signal });
    };

    const id = setInterval(tick, intervalMs);

    return () => {
      controller.abort();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, intervalMs]);

  async function updateStatus(id, newEstado) {
    try {
      await updatePedidoStatus(id, newEstado);
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: newEstado } : p)),
      );
    } catch (e) {
      console.error("updatePedidoStatus error:", e);
      setError(e?.message || "No se pudo actualizar el estado del pedido.");
    }
  }

  return { pedidos, loading, error, refresh, updateStatus };
}
