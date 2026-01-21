import React from "react";
import { normalizeModalidad } from "../utils/pedido";

export const Ticket80mm = React.forwardRef(function Ticket80mm(
  { pedido },
  ref,
) {
  const modalidadBig = String(
    normalizeModalidad(pedido?.modalidad) ?? "",
  ).toUpperCase();

  return (
    <div ref={ref} className="ticket80">
      <div className="brand">LA QUINTA COMIDAS</div>

      <div className="mode">{modalidadBig}</div>

      <div className="sep" />

      <div className="row">
        <div className="label">Fecha</div>
        <div className="value">{pedido?.fecha ?? ""}</div>
      </div>

      <div className="row">
        <div className="label">Hora</div>
        <div className="value">{pedido?.hora ?? ""}</div>
      </div>

      <div className="sep" />

      <div className="block">
        <div className="label">Cliente</div>
        <div>{pedido?.nombre ?? ""}</div>
      </div>

      <div className="block">
        <div className="label">Tel</div>
        <div>{pedido?.telefono ?? ""}</div>
      </div>

      {pedido?.direccion ? (
        <div className="block">
          <div className="label">Dirección</div>
          <div>{pedido.direccion}</div>
        </div>
      ) : null}

      <div className="sep" />

      <div className="label">Detalle</div>
      <div className="products">
        {String(pedido?.productos ?? "").trim() || "-"}
      </div>

      <div className="sep" />

      <div className="thanks">¡Gracias!</div>

      <div className="cut">
        <div className="cutTxt">CORTE ACA</div>
      </div>

      <div className="spacer" />
    </div>
  );
});
