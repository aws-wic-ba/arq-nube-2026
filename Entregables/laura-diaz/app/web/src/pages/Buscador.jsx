import { useEffect, useState } from 'react';
import { getPaises, getEspecies, getRequisitos, getAerolineas } from '../api';

export default function Buscador() {
  const [paises, setPaises] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [especie, setEspecie] = useState('');
  const [resultado, setResultado] = useState(null);
  const [aerolineas, setAerolineas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPaises().then(setPaises).catch(() => setError('No se pudo cargar la lista de países.'));
    getEspecies().then(setEspecies).catch(() => {});
  }, []);

  async function buscar(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const [req, aer] = await Promise.all([
        getRequisitos(origen, destino, especie),
        getAerolineas(origen, destino),
      ]);
      setResultado(req);
      setAerolineas(aer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>¿Qué necesito para mudarme con mi mascota?</h1>
      <p className="subtitle">
        Elegí país de origen, país de destino y especie para ver el checklist de requisitos.
      </p>

      <form className="card" onSubmit={buscar}>
        <div className="field">
          <label htmlFor="origen">País de origen</label>
          <select id="origen" value={origen} onChange={(e) => setOrigen(e.target.value)} required>
            <option value="">Elegí un país</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="destino">País de destino</label>
          <select id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} required>
            <option value="">Elegí un país</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="especie">Especie</label>
          <select id="especie" value={especie} onChange={(e) => setEspecie(e.target.value)} required>
            <option value="">Elegí una especie</option>
            {especies.map((esp) => (
              <option key={esp.id} value={esp.id}>{esp.nombre}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Ver checklist'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {resultado && (
        <div className="resultados">
          <section className="card">
            <h2>Requisitos de salida</h2>
            {resultado.salida.length === 0 && (
              <p className="empty">Todavía no cargamos requisitos de salida para este país.</p>
            )}
            <ol>
              {resultado.salida.map((r) => (
                <li key={r.id}>
                  {r.descripcion}
                  {r.plazoDiasAntes && (
                    <span className="plazo"> — con {r.plazoDiasAntes} días de anticipación</span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h2>Requisitos de entrada</h2>
            {resultado.entrada.length === 0 && (
              <p className="empty">Todavía no cargamos requisitos de entrada para este país.</p>
            )}
            <ol>
              {resultado.entrada.map((r) => (
                <li key={r.id}>
                  {r.descripcion}
                  {r.plazoDiasAntes && (
                    <span className="plazo"> — con {r.plazoDiasAntes} días de anticipación</span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h2>Aerolíneas en esta ruta</h2>
            {aerolineas.length === 0 && (
              <p className="empty">Todavía no tenemos datos de aerolíneas para esta ruta.</p>
            )}
            <ul>
              {aerolineas.map((a) => (
                <li key={a.id}>
                  <strong>{a.nombre}</strong> — {a.permiteCabina ? 'admite cabina' : 'no admite cabina'},{' '}
                  {a.permiteBodega ? 'admite bodega' : 'no admite bodega'}.
                  {a.restriccionRaza && <div className="nota">⚠️ {a.restriccionRaza}</div>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
