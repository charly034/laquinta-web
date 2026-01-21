import { useMemo, useRef, useState } from "react";
import "./App.css";
import { normalizeModalidad } from "./utils/pedido";

import { usePedidos } from "./hooks/usePedidos";
import {
  todayLabelEsAR,
  todayYMD_Mendoza,
  normalizeToYMD,
} from "./utils/dates";

import { HeaderControls } from "./components/HeaderControls";
import { PedidoCard } from "./components/PedidoCard";

import { useTicketPrint } from "./printing/useTicketPrint";

export default function App() {
  const [soloHoy, setSoloHoy] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { pedidos, loading, error, refresh } = usePedidos({
    autoRefresh,
    intervalMs: 15000,
  });

  const hoyYMD = todayYMD_Mendoza();
  const hoyLabel = todayLabelEsAR();

  // evita doble print
  const isPrintingRef = useRef(false);

  // impresión nueva (Android+Windows)
  const { printTicket, TicketPortal } = useTicketPrint();

  async function onPrint(pedido) {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    try {
      await printTicket(pedido);
    } finally {
      // importante: liberamos rápido para no bloquear la app
      setTimeout(() => {
        isPrintingRef.current = false;
      }, 300);
    }
  }

  const pedidosFiltrados = useMemo(() => {
    const list = Array.isArray(pedidos) ? pedidos : [];
    if (!soloHoy) return list;
    return list.filter((p) => normalizeToYMD(p.fecha) === hoyYMD);
  }, [pedidos, soloHoy, hoyYMD]);

  const totalHoy = useMemo(() => {
    const list = Array.isArray(pedidos) ? pedidos : [];
    return list.filter((p) => normalizeToYMD(p.fecha) === hoyYMD).length;
  }, [pedidos, hoyYMD]);

  const countTotalText = soloHoy
    ? `hoy (${totalHoy})`
    : `total (${pedidos.length})`;

  function buildPedidoText(p) {
    const lines = [
      "LA QUINTA COMIDAS",
      normalizeModalidad(p?.modalidad),
      "------------------------------",
      `${String(p?.fecha ?? "").trim()} · ${String(p?.hora ?? "").trim()}`.trim(),
      "------------------------------",
      `Cliente: ${String(p?.nombre ?? "").trim()}`.trim(),
      `Tel: ${String(p?.telefono ?? "").trim()}`.trim(),
      p?.direccion ? `Dir: ${String(p.direccion).trim()}` : null,
      "------------------------------",
      String(p?.productos ?? "").trim() || "-",
      "------------------------------",
    ].filter(Boolean);

    return lines.join("\n");
  }

  async function copyPedido(p) {
    const text = buildPedidoText(p);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  return (
    <div className="page">
      <HeaderControls
        soloHoy={soloHoy}
        setSoloHoy={setSoloHoy}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        hoyLabel={hoyLabel}
        countShown={pedidosFiltrados.length}
        countTotalText={countTotalText}
        onRefresh={() => refresh()}
      />

      <main className="content">
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Cargando…</div>}

        {!loading && !error && (
          <div className="list">
            {pedidosFiltrados.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                onPrint={onPrint}
                onCopy={copyPedido}
              />
            ))}

            {pedidosFiltrados.length === 0 && (
              <div className="loading">
                No hay pedidos para mostrar.
                {soloHoy && (
                  <div style={{ marginTop: 6, color: "#6b7280" }}>
                    Tip: desactivá “Solo hoy” para ver históricos.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        API: <code>https://laquintaapp-laquinta-api.gzsmus.easypanel.host</code>
      </footer>

      {/* Render oculto SOLO cuando imprimís */}
      <TicketPortal />
    </div>
  );
}
