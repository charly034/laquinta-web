import { buildTicket80mmHtml } from "./ticket80mm.js";
import { printHtmlInHiddenIframe } from "./printIframe.js";
import { buildTicket80mmText } from "./ticket80mmText.js";
import { shareTicketText } from "./shareTicketText.js";

// detector simple
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export async function printTicket(pedido, { onDone } = {}) {
  // ANDROID → TEXTO PLANO
  if (isAndroid()) {
    const html = buildTicket80mmHtml(pedido);
    printHtmlInHiddenIframe(html, { onDone });
    return;
  }

  // WINDOWS / DESKTOP → HTML + iframe oculto (kiosko)
  const html = buildTicket80mmHtml(pedido);
  printHtmlInHiddenIframe(html, { onDone });
}
