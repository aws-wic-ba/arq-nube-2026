import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Orden de las secciones: manuales primero (como pidió el usuario), después
// vacunas, después controles del catálogo.
const ORDEN_CATEGORIAS = [
  { clave: "manual", titulo: "Agregados manualmente" },
  { clave: "vacuna", titulo: "Vacunas" },
  { clave: "control", titulo: "Controles médicos" },
];

function ChecklistControles() {
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState("");
  const [usuarioReconocido, setUsuarioReconocido] = useState(false);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [edad, setEdad] = useState(null);
  const [items, setItems] = useState([]);
  const [manuales, setManuales] = useState([]);
  const [nuevoControl, setNuevoControl] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState({});
  const [error, setError] = useState("");
  // Estado de qué secciones están colapsadas (por categoría)
  const [colapsado, setColapsado] = useState({});

  const buscarUsuario = async () => {
    if (!email) return;
    setBuscandoUsuario(true);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setFechaNacimiento(data.fechaNacimiento);
        setSexo(data.sexo);
        setUsuarioReconocido(true);
      } else {
        setUsuarioReconocido(false);
      }
    } catch (err) {
      setUsuarioReconocido(false);
    } finally {
      setBuscandoUsuario(false);
    }
  };

  const obtenerPlanilla = async (e) => {
    e.preventDefault();
    setError("");

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
    const noCumplioAnioTodavia =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    if (noCumplioAnioTodavia) edadCalculada--;

    if (edadCalculada < 18) {
      setError("Esta app está diseñada para personas mayores de edad (18 años o más).");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/planilla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fechaNacimiento, sexo }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar la planilla");
      }
      const data = await res.json();
      setUsuarioId(data.usuarioId);
      setEdad(data.edad);
      setItems(data.items);
      setManuales(data.manuales || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarItem = async (item, cambios) => {
    setGuardando((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await fetch(`${API_URL}/api/historial`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          itemId: item.id,
          nombre: item.nombre,
          categoria: item.categoria,
          completado: cambios.completado,
          fechaRealizado: cambios.fechaRealizado,
          frecuenciaMeses: cambios.frecuenciaMeses,
          noAplica: cambios.noAplica,
        }),
      });
      const guardado = await res.json();
      return guardado.proximo_control || null;
    } catch (err) {
      console.error("Error al guardar el ítem:", err);
      return null;
    } finally {
      setGuardando((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const esManualPorId = (itemId) => itemId.startsWith("manual-");

  const actualizarItemLocal = (itemId, cambios) => {
    const setLista = esManualPorId(itemId) ? setManuales : setItems;
    setLista((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...cambios } : it)));
  };

  const persistirCambio = async (item, cambiosParciales) => {
    const cambios = {
      completado: item.completado,
      fechaRealizado: item.fechaRealizado,
      frecuenciaMeses: item.frecuenciaMeses,
      noAplica: item.noAplica,
      ...cambiosParciales,
    };
    actualizarItemLocal(item.id, cambios);
    const proximoControl = await guardarItem(item, cambios);
    actualizarItemLocal(item.id, { proximoControl });
  };

  const marcarCompletado = (item, completado) => persistirCambio(item, { completado });
  const cambiarFecha = (item, fechaRealizado) => persistirCambio(item, { fechaRealizado });
  const cambiarFrecuencia = (item, valor) =>
    persistirCambio(item, { frecuenciaMeses: valor === "" ? null : Number(valor) });
  const marcarNoAplica = (item, noAplica) => persistirCambio(item, { noAplica });

  const agregarControlManual = async () => {
    if (!nuevoControl.trim()) return;
    const nuevoItem = {
      id: `manual-${Date.now()}`,
      categoria: "manual",
      nombre: nuevoControl.trim(),
      nota: "Control agregado manualmente",
      frecuenciaMeses: null,
      completado: false,
      fechaRealizado: null,
      noAplica: false,
      proximoControl: null,
    };
    setManuales((prev) => [...prev, nuevoItem]);
    setNuevoControl("");
    await guardarItem(nuevoItem, { completado: false, fechaRealizado: null, frecuenciaMeses: null, noAplica: false });
  };

  const toggleColapso = (clave) => {
    setColapsado((prev) => ({ ...prev, [clave]: !prev[clave] }));
  };

  const renderFila = (item) => (
    <tr key={item.id} className={item.noAplica ? "fila-no-aplica" : ""}>
      <td>
        <input
          type="checkbox"
          checked={!!item.completado}
          disabled={item.noAplica}
          onChange={(e) => marcarCompletado(item, e.target.checked)}
        />
      </td>
      <td>
        <div className="nombre-control">
          <strong>{item.nombre}</strong>
        </div>
        {item.nota && <div className="nota-control">{item.nota}</div>}
      </td>
      <td>
        <input
          className="input-fecha"
          type="date"
          value={item.fechaRealizado || ""}
          disabled={item.noAplica}
          onChange={(e) => cambiarFecha(item, e.target.value)}
        />
      </td>
      <td>
        <input
          className="input-frecuencia"
          type="number"
          min="1"
          placeholder="único"
          value={item.frecuenciaMeses ?? ""}
          disabled={item.noAplica}
          onChange={(e) => cambiarFrecuencia(item, e.target.value)}
        />
        <span style={{ marginLeft: "4px", fontSize: "0.8rem", color: "#5c6b62" }}>meses</span>
      </td>
      <td>
        {item.noAplica ? "—" : item.frecuenciaMeses ? item.proximoControl || "—" : "Esquema único"}
        {guardando[item.id] && <span className="texto-guardando">guardando...</span>}
      </td>
      <td style={{ textAlign: "center" }}>
        <label className="etiqueta-na">
          <input
            type="checkbox"
            checked={!!item.noAplica}
            onChange={(e) => marcarNoAplica(item, e.target.checked)}
          />
          N/A
        </label>
      </td>
    </tr>
  );

  const gruposPorCategoria = {
    manual: manuales,
    vacuna: items.filter((i) => i.categoria === "vacuna"),
    control: items.filter((i) => i.categoria === "control"),
  };

  const totalItems = items.length + manuales.length;

  return (
    <>
      <div className="card">
        <h2>Generar mi planilla</h2>
        <p className="nota-app">Esta app está diseñada para personas mayores de edad (18 años o más).</p>

        <form onSubmit={obtenerPlanilla} className="formulario">
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={buscarUsuario}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} required>
              <option value="">Seleccionar...</option>
              <option value="mujer">Femenino</option>
              <option value="varon">Masculino</option>
            </select>
          </div>
          <button type="submit" className="boton-pill" disabled={cargando}>
            {cargando ? "Generando..." : "Generar planilla"}
          </button>
        </form>

        {buscandoUsuario && <p className="nota-app">Buscando datos...</p>}
        {usuarioReconocido && !buscandoUsuario && (
          <span className="aviso-reconocido">Te reconocimos — completamos tus datos automáticamente</span>
        )}
        {error && <p className="aviso-error">{error}</p>}

        {totalItems > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Agregar control manual</h3>
            <div className="agregar-manual">
              <input
                type="text"
                placeholder="Ej: Ecografía abdominal"
                value={nuevoControl}
                onChange={(e) => setNuevoControl(e.target.value)}
              />
              <button onClick={agregarControlManual} className="boton-pill secundario">
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="card">
          <p className="resumen-planilla">
            Edad calculada: <strong>{edad} años</strong> — {totalItems} controles/vacunas en tu planilla.
            Los cambios se guardan automáticamente. Tildá "N/A" si un control no aplica para vos.
          </p>

          {ORDEN_CATEGORIAS.map(({ clave, titulo }) => {
            const grupo = gruposPorCategoria[clave];
            if (grupo.length === 0) return null;
            const estaColapsado = !!colapsado[clave];

            return (
              <div key={clave} className="seccion-categoria">
                <button
                  type="button"
                  className="cabecera-seccion"
                  onClick={() => toggleColapso(clave)}
                >
                  <span>{estaColapsado ? "▸" : "▾"} {titulo}</span>
                  <span className="contador-seccion">{grupo.length}</span>
                </button>

                {!estaColapsado && (
                  <table className="tabla-controles">
                    <thead>
                      <tr>
                        <th>Hecho</th>
                        <th>Vacuna / Control</th>
                        <th>Fecha realizado</th>
                        <th>Frecuencia</th>
                        <th>Próximo control</th>
                        <th>No aplica</th>
                      </tr>
                    </thead>
                    <tbody>{grupo.map(renderFila)}</tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ChecklistControles;
