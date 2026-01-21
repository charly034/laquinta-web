// src/printing/ticket80mm.js
import { escapeHtml } from "../utils/text";
import { normalizeModalidad } from "../utils/pedido";

export function buildTicket80mmHtml(pedido) {
  const fecha = escapeHtml(pedido?.fecha ?? "");
  const hora = escapeHtml(pedido?.hora ?? "");
  const nombre = escapeHtml(pedido?.nombre ?? "");
  const telefono = escapeHtml(pedido?.telefono ?? "");
  const direccion = escapeHtml(pedido?.direccion ?? "");
  const modalidadBig = normalizeModalidad(pedido?.modalidad);

  const productosRaw = String(pedido?.productos ?? "").trim();
  const productosHtml = escapeHtml(productosRaw).replace(/\n/g, "<br/>");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
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

    .top-blank { height: 3.6em; } /* 3 líneas */
    .paper { width: 72mm; margin: 0 auto; }
    .ticket { font-size: 14px; line-height: 1.35; }
    .center { text-align: center; }
    .muted { color: #444; }

    .brand { font-size: 18px; font-weight: 900; letter-spacing: 0.6px; }

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

    .sep { border-top: 2px dashed #000; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; gap: 10px; }
    .label { font-weight: 900; font-size: 14px; }
    .value { text-align: right; font-size: 14px; }
    .block { margin-top: 8px; }

    .products {
      margin-top: 8px;
      font-size: 15px;
      line-height: 1.4;
      word-break: break-word;
    }

    .cut { margin-top: 14px; padding-top: 12px; border-top: 3px dashed #000; }
    .cut .txt { margin-top: 8px; font-size: 14px; font-weight: 900; text-align: center; }
    .spacer { height: 12mm; }
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

      <div class="cut"><div class="txt">✂️ CORTE ACÁ</div></div>

      <div class="spacer"></div>
    </div>
  </div>
</body>
</html>`;
}
