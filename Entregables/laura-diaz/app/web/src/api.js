const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Ocurrió un error al conectarse con la API.');
  }

  return res.json();
}

export const getPaises = () => request('/api/paises');

export const getEspecies = () => request('/api/especies');

export const getRequisitos = (origen, destino, especie) =>
  request(`/api/requisitos?origen=${origen}&destino=${destino}&especie=${especie}`);

export const getAerolineas = (origen, destino) =>
  request(`/api/aerolineas?origen=${origen}&destino=${destino}`);

export const getTips = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/tips${qs ? `?${qs}` : ''}`);
};

export const createTip = (data) =>
  request('/api/tips', { method: 'POST', body: JSON.stringify(data) });
