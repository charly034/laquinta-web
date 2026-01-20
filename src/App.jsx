/* eslint-disable no-useless-escape */
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { fetchPedidos } from "./services/pedidosApi";

// YYYY-MM-DD en Mendoza
function todayYMD_Mendoza() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Mendoza",
  });
}

// Para mostrar en UI: DD/MM/YYYY (Argentina)
function todayLabelEsAR() {
  return new Date().toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Mendoza",
  });
}

// Normaliza p.fecha a YYYY-MM-DD (acepta varios formatos comunes)
function normalizeToYMD(fecha) {
  if (fecha == null) return "";

  if (fecha instanceof Date) {
    return fecha.toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Mendoza",
    });
  }
  if (typeof fecha === "number") {
    return new Date(fecha).toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Mendoza",
    });
  }

  const f = String(fecha).trim();

  // ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss...
  if (/^\d{4}-\d{2}-\d{2}/.test(f)) return f.slice(0, 10);

  // DD/MM/YYYY o DD-MM-YYYY
  const m = f.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [soloHoy, setSoloHoy] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const hoyYMD = todayYMD_Mendoza();
  const hoyLabel = todayLabelEsAR();

  // Carga real (con abort controller)
  async function cargarPedidos({ signal } = {}) {
    try {
      setError("");
      const data = await fetchPedidos({ signal });
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.name !== "AbortError") {
        console.error("cargarPedidos error:", e);
        setError(e?.message || "No se pudieron cargar los pedidos.");
      }
    } finally {
      setLoading(false);
    }
  }

  // carga inicial
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    cargarPedidos({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto refresh cada 15s
  useEffect(() => {
    if (!autoRefresh) return;

    let controller = new AbortController();

    const tick = () => {
      // cancela si había una request colgada
      controller.abort();
      controller = new AbortController();
      cargarPedidos({ signal: controller.signal });
    };

    const id = setInterval(tick, 15000);

    return () => {
      controller.abort();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const pedidosFiltrados = useMemo(() => {
    const list = Array.isArray(pedidos) ? pedidos : [];
    if (!soloHoy) return list;
    return list.filter((p) => normalizeToYMD(p.fecha) === hoyYMD);
  }, [pedidos, soloHoy, hoyYMD]);

  const totalHoy = useMemo(() => {
    const list = Array.isArray(pedidos) ? pedidos : [];
    return list.filter((p) => normalizeToYMD(p.fecha) === hoyYMD).length;
  }, [pedidos, hoyYMD]);

  return (
    <div className="page">
      <header className="header">
        <h1>La Quinta · Pedidos</h1>

        <div className="controls">
          <button
            onClick={() => {
              setLoading(true);
              cargarPedidos();
            }}
          >
            Refrescar
          </button>

          <label className="toggle">
            <input
              type="checkbox"
              checked={soloHoy}
              onChange={(e) => setSoloHoy(e.target.checked)}
            />
            Solo hoy {soloHoy ? `(${hoyLabel})` : ""}
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto (15s)
          </label>

          <span className="counter">
            Mostrando <b>{pedidosFiltrados.length}</b> /{" "}
            {soloHoy ? `hoy (${totalHoy})` : `total (${pedidos.length})`}
          </span>
        </div>
      </header>

      <main className="content">
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Cargando…</div>}

        {!loading && !error && (
          <div className="list">
            {pedidosFiltrados.map((p) => {
              const mod = String(p.modalidad || "").toLowerCase();
              const badgeClass = mod === "delivery" ? "delivery" : "retiro";

              return (
                <div key={p.id} className="card">
                  <div className="cardHeader">
                    <div>
                      <div className="cardDate">
                        {p.fecha} · <span className="mono">{p.hora}</span>
                      </div>
                      <div className="cardName">{p.nombre}</div>
                    </div>

                    <span className={`badge ${badgeClass}`}>{p.modalidad}</span>
                  </div>

                  <div className="cardBody">
                    <div className="row">
                      <span className="label">📞 Tel</span>
                      <span className="value mono">{p.telefono}</span>
                    </div>

                    {p.direccion && (
                      <div className="row">
                        <span className="label">📍 Dir</span>
                        <span className="value">{p.direccion}</span>
                      </div>
                    )}

                    <div className="row" style={{ marginTop: 8 }}>
                      <span className="label">🍽️</span>
                      <span className="value productos">{p.productos}</span>
                    </div>
                  </div>
                </div>
              );
            })}

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
