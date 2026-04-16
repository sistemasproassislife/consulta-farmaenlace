"use client";
import { useState } from "react";

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const consultar = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cedula }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || json?.message || "No se pudo realizar la consulta.");
      } else {
        setData(json);
      }
    } catch (err) {
      setError("Ocurrió un error al consultar el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const renderData = () => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} style={styles.card}>
          {Object.entries(item).map(([key, value]) => (
            <div key={key} style={styles.row}>
              <span style={styles.label}>{formatearTexto(key)}:</span>
              <span style={styles.value}>{String(value ?? "")}</span>
            </div>
          ))}
        </div>
      ));
    }

    if (typeof data === "object") {
      return (
        <div style={styles.card}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={styles.row}>
              <span style={styles.label}>{formatearTexto(key)}:</span>
              <span style={styles.value}>
                {typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return <div style={styles.card}>{String(data)}</div>;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Consulta de cobertura</h1>
          <p style={styles.subtitle}>
            Ingresa el número de cédula para consultar la información disponible.
          </p>
        </div>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Ingresa la cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            style={styles.input}
            maxLength={13}
          />

          <button
            onClick={consultar}
            style={styles.button}
            disabled={loading || !cedula.trim()}
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {data && (
          <div style={styles.resultSection}>
            <h2 style={styles.resultTitle}>Resultado de la consulta</h2>
            {renderData()}
          </div>
        )}
      </div>
    </div>
  );
}

function formatearTexto(texto) {
  return texto
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f4f7fb 0%, #e9f0ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 15px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "850px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
    padding: "35px",
  },
  header: {
    marginBottom: "25px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#1f2a44",
  },
  subtitle: {
    marginTop: "10px",
    fontSize: "15px",
    color: "#667085",
  },
  searchBox: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "25px",
  },
  input: {
    flex: "1",
    minWidth: "260px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d0d5dd",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "14px 22px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "15px",
  },
  resultSection: {
    marginTop: "10px",
  },
  resultTitle: {
    fontSize: "22px",
    color: "#1f2a44",
    marginBottom: "15px",
  },
  card: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  label: {
    fontWeight: "bold",
    color: "#344054",
    minWidth: "180px",
  },
  value: {
    color: "#475467",
    wordBreak: "break-word",
    flex: 1,
  },
};
