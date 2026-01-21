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
      iframe.onbeforeunload = null;
      iframe.onload = null;
      const win = iframe.contentWindow;
      if (win) win.onafterprint = null;
    } catch {}
    try {
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    } catch {}
    onDone?.();
  };

  const win = iframe.contentWindow;
  const doc = win?.document;

  if (!win || !doc) {
    cleanup();
    return;
  }

  // afterprint (no siempre anda en Android, pero ayuda cuando está)
  win.onafterprint = () => {
    setTimeout(cleanup, 200);
  };

  iframe.onload = () => {
    // esperar 2 frames y un toque de tiempo para que Android renderice bien
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            win.focus();
            win.print();
          } catch {
            // si algo falla, igual limpiamos
            setTimeout(cleanup, 600);
          }

          // fallback cleanup si afterprint no dispara
          setTimeout(cleanup, 2500);
        }, 250);
      });
    });
  };

  doc.open();
  doc.write(html);
  doc.close();
}
