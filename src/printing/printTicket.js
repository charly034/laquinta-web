import { buildTicket80mmHtml } from "./ticket80mm";
import { printHtmlInHiddenIframe } from "./printIframe";

export function printTicket(pedido) {
  const html = buildTicket80mmHtml(pedido);
  printHtmlInHiddenIframe(html);
}
