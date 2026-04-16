"use client";
import { useState } from "react";

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    if (!cedula) {
      setData({
        Estado: "Error",
        Mensajes: ["Campo Requerido"],
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/consulta?nrodoc=${cedula}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      setData({
        Estado: "Error",
        Mensajes: ["Error al consultar el servicio"],
      });
    }

    setLoading(false);
  };

  const renderError = () => (
    <div style={styles.errorCard}>
      <h3>⚠️ Atención</h3>
      {data?.Mensajes?.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  );

  const renderSuccess = () => {
    const info = data?.Datos?.[0];
    if (!info) return null;

    return (
      <>
        {/* PLAN */}
        <div style={styles.card}>
          <h3>Información del Plan</h3>
          <p><b>Estado:</b> <span style={{color:"green"}}>{info.Estado}</span></p>
          <p><b>Producto:</b> {info.Producto}</p>
          <p><b>Plan:</b> {info.NombrePlan}</p>
          <p><b>Vademécum:</b> {info.Vademecum}</p>
        </div>

        {/* TITULAR */}
        <div style={styles.card}>
          <h3>Titular</h3>
          <p><b>Nombre:</b> {info.Titular?.Nombres} {info.Titular?.Apellidos}</p>
          <p><b>Documento:</b> {info.Titular?.NumeroDocumento}</p>
          <p><b>Edad:</b> {info.Titular?.Edad}</p>
          <p><b>Género:</b> {info.Titular?.Genero}</p>
        </div>

        {/* BENEFICIARIOS */}
        <div style={styles.card}>
          <h3>Beneficiarios</h3>
          {info.Beneficiarios?.map((b, i) => (
            <div key={i} style={styles.benef}>
              <p><b>{b.Nombres} {b.Apellidos}</b></p>
              <p>{b.RelacionDependiente}</p>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div style={styles.body}>
      {/* HEADER */}
      <div style={styles.header}>
        <img src="/logo-proassislife.png" style={{ height: 50 }} />
      </div>

      <div style={styles.container}>
        <h1>Consulta de cobertura</h1>

        <div style={styles.form}>
          <input
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ingrese cédula"
            style={styles.input}
          />
          <button onClick={consultar} style={styles.button}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        {/* RESULTADO */}
        {data && (
          <div style={{ marginTop: 30 }}>
            {data.Estado === "Error"
              ? renderError()
              : renderSuccess()}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    background: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  header: {
    background: "#ffffff",
    padding: 15,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    maxWidth: 900,
    margin: "40px auto",
    background: "white",
    padding: 30,
    borderRadius: 10,
  },
  form: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 20px",
    background: "#ff3b1f",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  benef: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  errorCard: {
    background: "#ffe5e5",
    padding: 20,
    borderRadius: 10,
    color: "#900",
  },
};
