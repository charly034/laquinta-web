import { getBadgeClass } from "../utils/pedido";

export function PedidoCard({ pedido, onPrint }) {
  const badgeClass = getBadgeClass(pedido?.modalidad);

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="cardDate">
            {pedido.fecha} · <span className="mono">{pedido.hora}</span>
          </div>
          <div className="cardName">{pedido.nombre}</div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`badge ${badgeClass}`}>{pedido.modalidad}</span>

          <button
            onClick={() => onPrint(pedido)}
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
