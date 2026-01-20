import { useMemo, useRef, useState } from "react";
import "./App.css";

import { usePedidos } from "./hooks/usePedidos";
import {
  todayLabelEsAR,
  todayYMD_Mendoza,
  normalizeToYMD,
} from "./utils/dates";

import { buildTicket80mmHtml } from "./printing/ticket80mm";
import { printHtmlInHiddenIframe } from "./printing/printIframe";

import { HeaderControls } from "./components/HeaderControls";
import { PedidoCard } from "./components/PedidoCard";

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

  function onPrint(pedido) {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    const html = buildTicket80mmHtml(pedido);

    printHtmlInHiddenIframe(html, {
      onDone: () => {
        isPrintingRef.current = false;
      },
    });
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
              <PedidoCard key={p.id} pedido={p} onPrint={onPrint} />
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
    </div>
  );
}
