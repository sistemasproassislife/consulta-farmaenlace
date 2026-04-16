"use client";
import { useState } from "react";

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [data, setData] = useState(null);

  const consultar = async () => {
    try {
      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cedula })
      });

      const json = await res.json();
      setData(json);
    } catch (error) {
      setData({ error: "Error al consultar", detalle: error.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Consulta de cobertura</h2>

      <input
        type="text"
        placeholder="Ingrese cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
      />

      <button onClick={consultar}>Consultar</button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
