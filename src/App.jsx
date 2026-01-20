/* eslint-disable no-useless-escape */
import { useEffect, useMemo, useRef, useState } from "react";
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

// Escapa HTML básico
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeModalidad(modalidad) {
  const m = String(modalidad ?? "")
    .trim()
    .toLowerCase();
  if (m.includes("del")) return "DELIVERY";
  return "RETIRO";
}

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [soloHoy, setSoloHoy] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const hoyYMD = todayYMD_Mendoza();
  const hoyLabel = todayLabelEsAR();

  // Evita doble print / re-entradas
  const isPrintingRef = useRef(false);

  // ====== IMPRIMIR TICKET 80mm (iframe oculto) ======
  function printTicket(p) {
    // Si ya se está imprimiendo, ignoramos (evita que vuelva a abrir)
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    const fecha = escapeHtml(p?.fecha ?? "");
    const hora = escapeHtml(p?.hora ?? "");
    const nombre = escapeHtml(p?.nombre ?? "");
    const telefono = escapeHtml(p?.telefono ?? "");
    const direccion = escapeHtml(p?.direccion ?? "");
    const modalidadBig = normalizeModalidad(p?.modalidad);

    const productosRaw = String(p?.productos ?? "").trim();
    const productosHtml = escapeHtml(productosRaw).replace(/\n/g, "<br/>");

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    /* Papel 80mm, área útil ~72mm */
    @page { size: 80mm auto; margin: 4mm; }

    html, body {
      margin: 0;
      padding: 0;
      width: 80mm;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        "Liberation Mono", "Courier New", monospace;
      color: #111;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* 3 líneas arriba */
    .top-blank {
      height: 3.6em; /* aprox 3 líneas con font-size base */
    }

    .paper {
      width: 72mm;
      margin: 0 auto;
    }

    .ticket {
      font-size: 14px;
      line-height: 1.35;
    }

    .center { text-align: center; }
    .muted { color: #444; }

    .brand {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.6px;
    }

    .mode {
      margin-top: 8px;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1.2px;
      padding: 8px 0;
      border: 3px solid #000;
      border-left: 0;
      border-right: 0;
      text-transform: uppercase;
    }

    .sep {
      border-top: 2px dashed #000;
      margin: 10px 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .label {
      font-weight: 900;
      font-size: 14px;
    }

    .value {
      text-align: right;
      font-size: 14px;
    }

    .block { margin-top: 8px; }

    .products {
      margin-top: 8px;
      font-size: 15px;
      line-height: 1.4;
      word-break: break-word;
    }

    .cut {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 3px dashed #000;
    }

    .cut .txt {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 900;
      text-align: center;
    }

    .spacer { height: 12mm; }

    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>

<body>
  <div class="top-blank"></div>

  <div class="paper">
    <div class="ticket">
      <div class="center brand">LA QUINTA COMIDAS</div>

      <div class="center mode">${modalidadBig}</div>

      <div class="sep"></div>

      <div class="row">
        <div class="label">Fecha</div>
        <div class="value">${fecha}</div>
      </div>

      <div class="row">
        <div class="label">Hora</div>
        <div class="value">${hora}</div>
      </div>

      <div class="sep"></div>

      <div class="block">
        <div class="label">Cliente</div>
        <div>${nombre}</div>
      </div>

      <div class="block">
        <div class="label">Tel</div>
        <div>${telefono}</div>
      </div>

      ${
        direccion
          ? `<div class="block">
               <div class="label">Dirección</div>
               <div>${direccion}</div>
             </div>`
          : ""
      }

      <div class="sep"></div>

      <div class="label">Detalle</div>
      <div class="products">${productosHtml || "-"}</div>

      <div class="sep"></div>

      <div class="center muted" style="margin-top:10px;">¡Gracias!</div>

      <div class="cut">
        <div class="txt">✂️ CORTE ACÁ</div>
      </div>

      <div class="spacer"></div>
    </div>
  </div>
</body>
</html>`;

    // Iframe oculto
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      } catch (e) {
        // ignore
      } finally {
        isPrintingRef.current = false;
      }
    };

    const win = iframe.contentWindow;
    const doc = win?.document;

    if (!doc || !win) {
      cleanup();
      alert("No se pudo inicializar la impresión.");
      return;
    }

    // Importante: NO poner window.print() dentro del HTML
    // para evitar que se dispare de nuevo al cancelar.
    // Imprimimos una sola vez acá, cuando carga el iframe.
    iframe.onload = () => {
      // Espera un toque para asegurar render + fonts
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch (e) {
          // ignore
        } finally {
          // Limpieza (aunque canceles, volvemos sin re-disparar)
          setTimeout(cleanup, 600);
        }
      }, 80);
    };

    doc.open();
    doc.write(html);
    doc.close();
  }
  // ====== FIN IMPRIMIR TICKET ======

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

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <span className={`badge ${badgeClass}`}>
                        {p.modalidad}
                      </span>

                      <button
                        onClick={() => printTicket(p)}
                        title="Imprimir ticket (80mm)"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        🧾 Imprimir
                      </button>
                    </div>
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
