import { buildTicket80mmHtml } from "./ticket80mm";

export function printTicket(pedido) {
  const html = buildTicket80mmHtml(pedido);

  // Importante: abrir tab nueva (en Android funciona mejor que popup chico)
  const w = window.open("about:blank", "_blank");

  if (!w) {
    alert("Pop-up bloqueado. Permití ventanas emergentes para imprimir.");
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();

  // En Android a veces onload no dispara: hacemos ambos
  const doPrint = () => {
    try {
      w.focus();
      w.print();
    } catch (e) {
      console.error("print() falló:", e);
    }

    // cerrar después (si no deja, no pasa nada)
    setTimeout(() => {
      try {
        w.close();
      } catch {}
    }, 800);
  };

  w.onload = () => setTimeout(doPrint, 150);
  setTimeout(doPrint, 600); // fallback
}
