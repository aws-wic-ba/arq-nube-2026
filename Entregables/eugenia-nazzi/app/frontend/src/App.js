import React, { useEffect, useState } from "react";
import ChecklistControles from "./ChecklistControles";
import "./styles.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function App() {
  const [status, setStatus] = useState("verificando...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status === "ok" ? "conectado" : "sin conexión"))
      .catch(() => setStatus("sin conexión"));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        {/* Garabatos decorativos simples, en el mismo espíritu del estilo de referencia */}
        <svg className="doodle" style={{ top: 20, left: 30 }} width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path
            d="M23 6c6 0 9 4 9 9s-4 8-9 8-8-3-8-8 3-9 8-9z"
            stroke="#faf6ec"
            strokeWidth="2"
          />
        </svg>
        <svg className="doodle" style={{ top: 30, right: 40 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M2 20c8-6 16 6 24 0s10-14 12-6" stroke="#faf6ec" strokeWidth="2" fill="none" />
        </svg>

        <h1>Controles Médicos y Vacunas</h1>
        <p>Tu planilla personalizada de prevención, siempre al día.</p>
        <span className="estado-backend">
          Estado del sistema: {status === "conectado" ? "conectado ✅" : status === "sin conexión" ? "sin conexión ❌" : status}
        </span>
      </header>

      <main className="app-content">
        <ChecklistControles />
      </main>
    </div>
  );
}

export default App;
