// src/printing/shareTicketText.js
export async function shareTicketText(ticketText) {
  const text = String(ticketText ?? "");

  // Intento 1: compartir archivo (mejor para apps de impresora)
  try {
    const file = new File([text], "ticket.txt", {
      type: "text/plain;charset=utf-8",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Ticket La Quinta",
        text: "Ticket",
        files: [file],
      });
      return;
    }
  } catch {
    // seguimos
  }

  // Intento 2: compartir solo texto
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Ticket La Quinta",
        text,
      });
      return;
    }
  } catch {
    // seguimos
  }

  // Fallback: descargar txt
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ticket.txt";
  a.click();
  URL.revokeObjectURL(url);
}
