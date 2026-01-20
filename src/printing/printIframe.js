export function printHtmlInHiddenIframe(html, { onDone } = {}) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    } catch {
      // ignore
    } finally {
      onDone?.();
    }
  };

  const win = iframe.contentWindow;
  const doc = win?.document;

  if (!win || !doc) {
    cleanup();
    return;
  }

  iframe.onload = () => {
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } finally {
        setTimeout(cleanup, 600);
      }
    }, 80);
  };

  doc.open();
  doc.write(html);
  doc.close();
}
