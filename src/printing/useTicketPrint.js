import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Ticket80mm } from "./Ticket80mm";

export function useTicketPrint() {
  const ticketRef = useRef(null);
  const [printPedido, setPrintPedido] = useState(null);

  const doPrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: printPedido?.id ? `Ticket_${printPedido.id}` : "Ticket",
    onAfterPrint: () => setPrintPedido(null),
    removeAfterPrint: true,
  });

  async function printTicket(pedido) {
    // renderizamos el ticket “fuera de pantalla” y luego imprimimos
    setPrintPedido(pedido);
    await new Promise((r) => setTimeout(r, 50));
    doPrint();
  }

  // componente a renderizar (en App o donde prefieras)
  const TicketPortal = () =>
    printPedido ? (
      <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
        <Ticket80mm ref={ticketRef} pedido={printPedido} />
      </div>
    ) : null;

  return { printTicket, TicketPortal };
}
