/* eslint-disable no-useless-escape */
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE;

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

  // si viene Date o number
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

  // si no se puede interpretar, devolvemos vacío (así no matchea "hoy")
  return "";
}

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soloHoy, setSoloHoy] = useState(true);

  async function cargarPedidos() {
    try {
      setError("");
      setLoading(true);

      const res = await fetch(`${API_BASE}/pedidos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pedidos. Revisá la API / CORS.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(cargarPedidos, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const hoyYMD = todayYMD_Mendoza();
  const hoyLabel = todayLabelEsAR();

  const pedidosFiltrados = useMemo(() => {
    const term = query.trim().toLowerCase();

    return pedidos
      .filter((p) => {
        if (!soloHoy) return true;
        return normalizeToYMD(p.fecha) === hoyYMD;
      })
      .filter((p) => {
        if (!term) return true;
        const texto = [
          p.id,
          p.fecha,
          p.hora,
          p.telefono,
          p.nombre,
          p.direccion,
          p.modalidad,
          p.productos,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(term);
      });
  }, [pedidos, query, soloHoy, hoyYMD]);

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="logo">
            <img src="./logo.jpg" alt="" />
          </div>
          <div>
            <h1 className="title">La Quinta · Pedidos</h1>
            <p className="subtitle">
              {soloHoy ? (
                <>
                  Mostrando <b>solo hoy</b> ({hoyLabel})
                </>
              ) : (
                <>
                  Mostrando <b>todos</b> los pedidos
                </>
              )}
            </p>
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-ghost" onClick={cargarPedidos}>
            Refrescar
          </button>

          <label className="toggle">
            <input
              type="checkbox"
              checked={soloHoy}
              onChange={(e) => setSoloHoy(e.target.checked)}
            />
            <span>Solo hoy</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto (15s)</span>
          </label>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="searchWrap">
            <span className="searchIcon">⌕</span>
            <input
              className="search"
              placeholder="Buscar por nombre, teléfono, productos, dirección, ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="count">
            <span className="pill">
              {pedidosFiltrados.length} / {soloHoy ? "hoy" : "total"}{" "}
              {soloHoy
                ? pedidos.filter((p) => normalizeToYMD(p.fecha) === hoyYMD)
                    .length
                : pedidos.length}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <div className="loading">Cargando pedidos…</div>}

        {!loading && (
          <div className="cards">
            {pedidosFiltrados.map((p) => {
              const mod = String(p.modalidad || "").toLowerCase();
              const isDelivery = mod === "delivery";

              return (
                <div key={p.id} className="card">
                  <div className="cardHeader">
                    <div className="cardMeta">
                      <div className="cardDate">
                        {p.fecha} · <span className="mono">{p.hora}</span>
                      </div>
                      <div className="cardName">{p.nombre}</div>
                    </div>

                    <span
                      className={`badge ${
                        isDelivery ? "badge-delivery" : "badge-retiro"
                      }`}
                    >
                      {p.modalidad}
                    </span>
                  </div>

                  <div className="cardBody">
                    <div className="row">
                      <span className="label">📞 Tel</span>
                      <span className="value mono">{p.telefono}</span>
                    </div>

                    {p.direccion && (
                      <div className="row">
                        <span className="label">📍 Dirección</span>
                        <span className="value">{p.direccion}</span>
                      </div>
                    )}

                    <div className="divider" />

                    <div className="row rowTop">
                      <span className="label">🍽️ Pedido</span>
                      <span className="value productos">{p.productos}</span>
                    </div>
                  </div>

                  <div className="cardFooter">
                    <span className="monoSmall">{p.id}</span>

                    <button
                      className="btn btn-small"
                      onClick={() =>
                        navigator.clipboard.writeText(p.productos || "")
                      }
                      title="Copiar productos"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              );
            })}

            {pedidosFiltrados.length === 0 && (
              <div className="empty">
                No hay pedidos para mostrar.
                {soloHoy && (
                  <div className="emptyHint">
                    Tip: desactivá “Solo hoy” para ver históricos.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="footer">
        API: <code>{API_BASE}</code>
      </footer>
    </div>
  );
}
