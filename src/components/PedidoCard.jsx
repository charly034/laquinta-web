import { getBadgeClass } from "../utils/pedido";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { printTicket } from "../printing/printTicket";

function buildWhatsAppMessage(p) {
  const nombre = String(p?.nombre ?? "").trim();
  const telefono = String(p?.telefono ?? "").trim();
  const direccion = String(p?.direccion ?? "").trim();
  const productos = String(p?.productos ?? "").trim();
  const modalidad = String(p?.modalidad ?? "").trim();

  const lines = [
    `Hola *${nombre}* 👋`,
    ``,
    `Te confirmamos tu pedido en *La Quinta Comidas* 🥘`,
    ``,
    `📅 *Fecha:* ${p?.fecha ?? ""}`,
    `👤 *Cliente:* ${nombre}`,
    `📞 *Tel:* ${telefono}`,
    direccion ? `📍 *Dirección:* ${direccion}` : null,
    ``,
    `🍽️ *Pedido:*`,
    productos || "-",
    ``,
    `🚚 *Modalidad:* ${modalidad}`,
    ``,
    `¡Muchas gracias por tu pedido! 🙌`,
    `Cualquier cosa nos escribís por acá 😊`,
  ];

  return lines.filter(Boolean).join("\n");
}

export function PedidoCard({ pedido, onCopy }) {
  const badgeClass = getBadgeClass(pedido?.modalidad);

  const waUrl = buildWhatsAppUrl({
    telefono: pedido?.telefono,
    text: buildWhatsAppMessage(pedido),
  });

  const canWhatsApp = Boolean(waUrl);

  function openWhatsApp() {
    if (!waUrl) {
      alert("Teléfono inválido para WhatsApp. Revisá el formato.");
      return;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  function onPrintClick() {
    console.log("CLICK IMPRIMIR", pedido?.id); // debug
    printTicket(pedido);
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="cardDate">
            {pedido.fecha} · <span className="mono">{pedido.hora}</span>
          </div>
          <div className="cardName">{pedido.nombre}</div>
        </div>

        <div className="cardHeaderRight">
          <span className={`badge ${badgeClass}`}>{pedido.modalidad}</span>

          <div className="cardActions">
            <button
              onClick={onPrintClick}
              title="Imprimir ticket (80mm)"
              className="cardBtn btn-print"
            >
              🖨️ Imprimir
            </button>

            <button
              onClick={() => onCopy?.(pedido)}
              title="Copiar pedido"
              className="cardBtn btn-copy"
            >
              📋 Copiar
            </button>

            <button
              onClick={openWhatsApp}
              disabled={!canWhatsApp}
              title={
                canWhatsApp
                  ? "Abrir WhatsApp del cliente"
                  : "Teléfono inválido para WhatsApp"
              }
              className={`cardBtn btn-whatsapp ${!canWhatsApp ? "disabled" : ""}`}
            >
              💬 WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="cardBody">
        <div className="row">
          <span className="label">📞 Tel</span>
          <span className="value mono">{pedido.telefono}</span>
        </div>

        {pedido.direccion && (
          <div className="row">
            <span className="label">📍 Dir</span>
            <span className="value">{pedido.direccion}</span>
          </div>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <span className="label">🍽️</span>
          <span className="value productos">{pedido.productos}</span>
        </div>
      </div>
    </div>
  );
}
