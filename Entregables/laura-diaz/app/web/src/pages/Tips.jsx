import { useEffect, useState } from 'react';
import { getPaises, getEspecies, getTips, createTip } from '../api';

const formInicial = {
  autor: '',
  texto: '',
  calificacionDificultad: 3,
  paisOrigenId: '',
  paisDestinoId: '',
  especieId: '',
};

export default function Tips() {
  const [paises, setPaises] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getPaises().then(setPaises);
    getEspecies().then(setEspecies);
    cargarTips();
  }, []);

  function cargarTips() {
    getTips().then(setTips).catch(() => setError('No se pudieron cargar las experiencias.'));
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await createTip(form);
      setForm(formInicial);
      cargarTips();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>Experiencias de otros que ya lo hicieron</h1>
      <p className="subtitle">
        Contá tu experiencia para ayudar a la próxima persona que tenga que hacer este mismo trámite.
      </p>

      <form className="card" onSubmit={enviar}>
        <div className="field">
          <label htmlFor="autor">Tu nombre</label>
          <input
            id="autor"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="paisOrigenId">País de origen</label>
          <select
            id="paisOrigenId"
            value={form.paisOrigenId}
            onChange={(e) => setForm({ ...form, paisOrigenId: e.target.value })}
            required
          >
            <option value="">Elegí un país</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="paisDestinoId">País de destino</label>
          <select
            id="paisDestinoId"
            value={form.paisDestinoId}
            onChange={(e) => setForm({ ...form, paisDestinoId: e.target.value })}
            required
          >
            <option value="">Elegí un país</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="especieId">Especie</label>
          <select
            id="especieId"
            value={form.especieId}
            onChange={(e) => setForm({ ...form, especieId: e.target.value })}
            required
          >
            <option value="">Elegí una especie</option>
            {especies.map((esp) => (
              <option key={esp.id} value={esp.id}>{esp.nombre}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="calificacionDificultad">Qué tan difícil fue (1 a 5)</label>
          <input
            id="calificacionDificultad"
            type="number"
            min="1"
            max="5"
            value={form.calificacionDificultad}
            onChange={(e) => setForm({ ...form, calificacionDificultad: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="texto">Contanos tu experiencia</label>
          <textarea
            id="texto"
            rows="4"
            value={form.texto}
            onChange={(e) => setForm({ ...form, texto: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Compartir experiencia'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="tips-list">
        {tips.map((t) => (
          <article key={t.id} className="card tip">
            <header>
              <strong>{t.autor}</strong>
              <span className="ruta">{t.paisOrigen.nombre} → {t.paisDestino.nombre} ({t.especie.nombre})</span>
              <span className="dificultad">Dificultad: {t.calificacionDificultad}/5</span>
            </header>
            <p>{t.texto}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
