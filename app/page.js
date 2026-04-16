"use client";
import { useState } from "react";

export default function Home() {
  const [cedula, setCedula] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const consultar = async () => {
    setLoading(true);
    setError("");
    setRespuesta(null);

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
        setRespuesta(json);
      }
    } catch (err) {
      setError("Ocurrió un error al consultar.");
    } finally {
      setLoading(false);
    }
  };

  const estado = respuesta?.Estado || respuesta?.estado || "";
  const mensajes = respuesta?.Mensajes || respuesta?.mensajes || [];

  let datos = [];
  try {
    const rawDatos = respuesta?.Datos || respuesta?.datos || "[]";
    datos = typeof rawDatos === "string" ? JSON.parse(rawDatos) : rawDatos;
  } catch {
    datos = [];
  }

  const plan = datos?.[0] || {};
  const titular = plan?.Titular || {};
  const beneficiarios = plan?.Beneficiarios || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Consulta de cobertura</h1>
        <p style={styles.subtitle}>
          Ingresa el número de cédula para consultar la información disponible.
        </p>

        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Ingresa la cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            style={styles.input}
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

        {respuesta && (
          <div style={styles.resultsWrapper}>
            <SectionTitle>Información del Plan</SectionTitle>
            <div style={styles.card}>
              <InfoGrid
                items={[
                  ["Estado", <span style={styles.estadoOk}>{plan?.Estado || estado || "-"}</span>],
                  ["Producto", plan?.Producto || "-"],
                  ["Plan", plan?.NombrePlan || "-"],
                  ["Tipo de Vademecum", plan?.Vademecum || "-"],
                  ["Código Plan", plan?.CodigoPlan || "-"],
                  ["Cobertura Máxima", plan?.CoberturaMaxima ?? "-"],
                ]}
              />
            </div>

            <SectionTitle>Titular</SectionTitle>
            <div style={styles.card}>
              <InfoGrid
                items={[
                  ["Nombre", unirNombre(titular?.Nombres, titular?.Apellidos)],
                  ["Documento", unirDocumento(titular?.TipoDocumento, titular?.NumeroDocumento)],
                  ["Edad", titular?.Edad ?? calcularEdad(titular?.FechaNacimiento) ?? "-"],
                  ["Género", titular?.Genero || "-"],
                  ["Fecha Nacimiento", formatearFecha(titular?.FechaNacimiento)],
                  ["Fecha Vigencia", formatearFecha(plan?.FechaVigencia)],
                ]}
              />
            </div>

            <SectionTitle>Beneficiarios</SectionTitle>
            {beneficiarios.length > 0 ? (
              beneficiarios.map((benef, index) => (
                <div style={styles.card} key={index}>
                  <InfoGrid
                    items={[
                      ["Nombre", unirNombre(benef?.Nombres, benef?.Apellidos)],
                      ["Documento", unirDocumento(benef?.TipoDocumento, benef?.NumeroDocumento)],
                      ["Relación", benef?.RelacionDependiente || "-"],
                      ["Edad", benef?.Edad ?? "-"],
                      ["Género", benef?.Genero || "-"],
                      ["En Carencia", valorBooleano(benef?.EnCarencia)],
                    ]}
                  />

                  {Array.isArray(benef?.BeneficiosPlan) && benef.BeneficiosPlan.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <div style={styles.subTitle}>Beneficios del plan</div>
                      <div style={styles.benefitsWrap}>
                        {benef.BeneficiosPlan.map((b, i) => (
                          <div key={i} style={styles.benefitChip}>
                            Valor: {b?.Valor ?? "-"} | Es por plan: {valorBooleano(b?.EsPorPlan)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.card}>
                <span>No existen beneficiarios registrados.</span>
              </div>
            )}

            {mensajes?.length > 0 && (
              <>
                <SectionTitle>Mensajes</SectionTitle>
                <div style={styles.card}>
                  {mensajes.map((m, i) => (
                    <div key={i} style={styles.messageItem}>
                      {m}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>;
}

function InfoGrid({ items }) {
  return (
    <div style={styles.grid}>
      {items.map(([label, value], index) => (
        <div key={index} style={styles.gridItem}>
          <div style={styles.label}>{label}:</div>
          <div style={styles.value}>{value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function unirNombre(nombres, apellidos) {
  return [nombres, apellidos].filter(Boolean).join(" ") || "-";
}

function unirDocumento(tipo, numero) {
  return [tipo, numero].filter(Boolean).join(" ") || "-";
}

function valorBooleano(valor) {
  if (valor === true || valor === "true") return "Sí";
  if (valor === false || valor === "false") return "No";
  return valor ?? "-";
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const soloFecha = String(fecha).split("T")[0];
  const partes = soloFecha.split("-");
  if (partes.length !== 3) return soloFecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularEdad(fecha) {
  if (!fecha) return null;
  const nacimiento = new Date(fecha);
  if (Number.isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef3fb",
    padding: "28px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
    background: "#fff",
    padding: "36px",
    borderRadius: "22px",
    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
  },
  title: {
    textAlign: "center",
    margin: 0,
    color: "#17356d",
    fontSize: "40px",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: "#5e6f8e",
    fontSize: "16px",
    marginTop: "10px",
    marginBottom: "30px",
  },
  searchRow: {
    display: "flex",
    gap: "14px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: "260px",
    padding: "18px 20px",
    borderRadius: "16px",
    border: "1px solid #cfd7e6",
    fontSize: "28px",
    outline: "none",
  },
  button: {
    padding: "0 28px",
    borderRadius: "16px",
    border: "none",
    background: "#2f66e8",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    minHeight: "62px",
  },
  errorBox: {
    background: "#fdecec",
    color: "#b42318",
    border: "1px solid #f7caca",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  resultsWrapper: {
    marginTop: "10px",
  },
  sectionTitle: {
    color: "#0e539c",
    fontSize: "24px",
    fontStyle: "italic",
    marginTop: "26px",
    marginBottom: "14px",
    borderBottom: "1px solid #d9e1ef",
    paddingBottom: "10px",
  },
  card: {
    background: "#f7f9fc",
    border: "1px solid #d5dcea",
    borderRadius: "10px",
    padding: "16px 18px",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px 24px",
  },
  gridItem: {
    minHeight: "40px",
  },
  label: {
    fontWeight: "700",
    fontStyle: "italic",
    color: "#232f4b",
    marginBottom: "3px",
  },
  value: {
    color: "#4b5565",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },
  estadoOk: {
    color: "#138a36",
    fontWeight: "700",
  },
  subTitle: {
    fontWeight: "700",
    color: "#17356d",
    marginBottom: "10px",
  },
  benefitsWrap: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  benefitChip: {
    background: "#e9f0ff",
    color: "#17356d",
    border: "1px solid #c6d6ff",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "14px",
  },
  messageItem: {
    padding: "10px 0",
    borderBottom: "1px solid #e5e9f2",
    color: "#344054",
  },
};
