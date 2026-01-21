// src/printing/ticket80mmText.js
import { normalizeModalidad } from "../utils/pedido";

function toAsciiSafe(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buildTicket80mmText(pedido) {
  const fecha = pedido?.fecha ?? "";
  const hora = pedido?.hora ?? "";
  const nombre = pedido?.nombre ?? "";
  const telefono = pedido?.telefono ?? "";
  const direccion = pedido?.direccion ?? "";
  const modalidadBig = normalizeModalidad(pedido?.modalidad);

  const productosRaw = String(pedido?.productos ?? "").trim();

  const lines = [];
  lines.push("LA QUINTA COMIDAS");
  lines.push("--------------------------------");
  lines.push(String(modalidadBig).toUpperCase());
  lines.push("--------------------------------");
  lines.push(`Fecha: ${fecha}`);
  lines.push(`Hora : ${hora}`);
  lines.push("--------------------------------");
  lines.push("Cliente:");
  lines.push(nombre);
  lines.push(`Tel: ${telefono}`);
  if (direccion) {
    lines.push("Direccion:");
    lines.push(direccion);
  }
  lines.push("--------------------------------");
  lines.push("Detalle:");
  lines.push(productosRaw || "-");
  lines.push("--------------------------------");
  lines.push("Gracias!");
  lines.push("");
  lines.push("CORTE ACA");
  lines.push("");

  return toAsciiSafe(lines.join("\n"));
}
