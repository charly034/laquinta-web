import { useState } from "react";
import "./App.css";

import { usePedidos } from "./hooks/usePedidos";
import { useFilteredPedidos } from "./hooks/useFilteredPedidos";
import { todayLabelEsAR } from "./utils/dates";

import { HeaderControls } from "./components/HeaderControls";
import { PedidosList } from "./components/PedidosList";
import { Footer } from "./components/Footer";

export default function App() {
  const [soloHoy, setSoloHoy] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hideFinalizados, setHideFinalizados] = useState(true);

  const { pedidos, loading, error, refresh, updateStatus } = usePedidos({
    autoRefresh,
    intervalMs: 15000,
  });

  const { pedidosFiltrados, countTotalText } = useFilteredPedidos(
    pedidos,
    soloHoy,
    hideFinalizados,
  );

  const hoyLabel = todayLabelEsAR();

  return (
    <div className="page">
      {" "}
      <div className="logoContainer">
        <img src="/logo.jpg" alt="La Quinta Comidas" className="logoHeader" />
      </div>{" "}
      <HeaderControls
        soloHoy={soloHoy}
        setSoloHoy={setSoloHoy}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        hideFinalizados={hideFinalizados}
        setHideFinalizados={setHideFinalizados}
        hoyLabel={hoyLabel}
        countShown={pedidosFiltrados.length}
        countTotalText={countTotalText}
        onRefresh={() => refresh()}
      />
      <main className="content">
        <PedidosList
          pedidosFiltrados={pedidosFiltrados}
          loading={loading}
          error={error}
          updateStatus={updateStatus}
          soloHoy={soloHoy}
        />
      </main>
      <Footer />
    </div>
  );
}
