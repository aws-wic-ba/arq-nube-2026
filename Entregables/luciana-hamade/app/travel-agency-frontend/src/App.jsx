import { useEffect, useState } from 'react';
import { Plane, Globe, X, Plus, Lock, Unlock, Edit2, Trash2 } from 'lucide-react';

// 🔹 Componente Tarjeta con Efecto Hover
function DestinoCard({ dest, isAdmin, onReserva, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        // 💫 Efecto Hover: elevación y sombra dinámica
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 12px 20px -5px rgba(2, 132, 199, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' 
          : '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
    >
      {/* Botones Admin sobre la tarjeta */}
      {isAdmin && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(dest); }}
            title="Editar precio"
            style={{ backgroundColor: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', color: '#0284c7' }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(dest.id, dest.nombre); }}
            title="Ocultar/Eliminar destino"
            style={{ backgroundColor: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', color: '#ef4444' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Imagen con ligero zoom al hacer hover */}
      <div style={{ overflow: 'hidden', height: '180px' }}>
        <img 
          src={dest.imagen} 
          alt={dest.nombre} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }} 
        />
      </div>

      <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', textAlign: 'center' }}>{dest.nombre}</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'center' }}>{dest.descripcion}</p>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1' }}>
            {dest.moneda} ${Number(dest.precio).toLocaleString()}
          </span>
          <button 
            onClick={() => onReserva(dest)}
            style={{ 
              backgroundColor: isHovered ? '#0369a1' : '#0284c7', 
              color: 'white', 
              border: 'none', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado Admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal Reserva
  const [isReservaOpen, setIsReservaOpen] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [fechaViaje, setFechaViaje] = useState('');
  const [reservaStatus, setReservaStatus] = useState(null);

  // Modal Nuevo Destino
  const [isNuevoDestinoOpen, setIsNuevoDestinoOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaMoneda, setNuevaMoneda] = useState('USD');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [crearStatus, setCrearStatus] = useState(null);

  // Modal Editar Precio
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDestino, setEditDestino] = useState(null);
  const [editPrecio, setEditPrecio] = useState('');

  const fetchDestinos = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/destinos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDestinos(data.data);
        } else {
          setError('No se pudieron cargar los destinos.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error al conectar con la API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDestinos();
  }, []);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pass = prompt('Ingresá la clave de administrador:');
      if (pass === 'admin123') {
        setIsAdmin(true);
      } else if (pass !== null) {
        alert('Clave incorrecta.');
      }
    }
  };

  // Handlers Reserva
  const handleOpenReserva = (destino) => {
    setSelectedDestino(destino);
    setReservaStatus(null);
    setIsReservaOpen(true);
  };

  const handleCloseReserva = () => {
    setIsReservaOpen(false);
    setSelectedDestino(null);
    setNombreCliente('');
    setEmailCliente('');
    setFechaViaje('');
    setReservaStatus(null);
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    setReservaStatus({ type: 'info', message: 'Procesando reserva...' });

    try {
      const res = await fetch('http://localhost:4000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinoId: selectedDestino.id,
          nombreCliente,
          emailCliente,
          fechaViaje
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReservaStatus({ type: 'success', message: '¡Reserva confirmada con éxito! 🎉' });
        setTimeout(() => handleCloseReserva(), 2000);
      } else {
        setReservaStatus({ type: 'error', message: data.error || 'Error al procesar la reserva.' });
      }
    } catch (err) {
      setReservaStatus({ type: 'error', message: 'No se pudo conectar con el servidor.' });
    }
  };

  // Handlers Nuevo Destino
  const handleOpenNuevoDestino = () => {
    setCrearStatus(null);
    setIsNuevoDestinoOpen(true);
  };

  const handleCloseNuevoDestino = () => {
    setIsNuevoDestinoOpen(false);
    setNuevoNombre('');
    setNuevaDescripcion('');
    setNuevoPrecio('');
    setNuevaMoneda('USD');
    setNuevaImagen('');
    setCrearStatus(null);
  };

  const handleCrearDestino = async (e) => {
    e.preventDefault();
    setCrearStatus({ type: 'info', message: 'Guardando nuevo destino...' });

    try {
      const res = await fetch('http://localhost:4000/api/destinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          descripcion: nuevaDescripcion,
          precio: parseFloat(nuevoPrecio),
          moneda: nuevaMoneda,
          imagen: nuevaImagen || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCrearStatus({ type: 'success', message: '¡Destino creado con éxito! ✈️' });
        fetchDestinos();
        setTimeout(() => handleCloseNuevoDestino(), 1800);
      } else {
        setCrearStatus({ type: 'error', message: data.error || 'Error al guardar.' });
      }
    } catch (err) {
      setCrearStatus({ type: 'error', message: 'Error de conexión.' });
    }
  };

  // Handlers Editar Precio
  const handleOpenEdit = (destino) => {
    setEditDestino(destino);
    setEditPrecio(destino.precio);
    setIsEditOpen(true);
  };

  const handleSavePrecio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/destinos/${editDestino.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editDestino,
          precio: parseFloat(editPrecio)
        })
      });

      if (res.ok) {
        fetchDestinos();
        setIsEditOpen(false);
      } else {
        alert('No se pudo actualizar el precio.');
      }
    } catch (err) {
      alert('Error de conexión al actualizar el precio.');
    }
  };

  // Handler Eliminar
  const handleDeleteDestino = async (id, nombre) => {
    if (confirm(`¿Seguro que querés ocultar/eliminar "${nombre}"?`)) {
      try {
        const res = await fetch(`http://localhost:4000/api/destinos/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          fetchDestinos();
        } else {
          alert('Error al eliminar el destino.');
        }
      } catch (err) {
        alert('Error al conectar con la API.');
      }
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FEF9F2', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#1e293b' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#0284c7', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
          {isAdmin && (
            <button 
              onClick={handleOpenNuevoDestino}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Nuevo Destino
            </button>
          )}
        </div>

        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '54px', height: '54px' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', color: 'white', opacity: 0.85 }}>
              <Globe size={36} strokeWidth={1.5} />
            </div>
            <div style={{ position: 'absolute', color: '#FEF9F2', transform: 'rotate(-45deg)' }}>
              <Plane size={22} strokeWidth={2.5} />
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
            Ghirba Travel - Tu Agencia de Viajes
          </h1>
        </div>

        {/* BOTÓN ADMIN */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleToggleAdmin}
            style={{ backgroundColor: isAdmin ? '#e0f2fe' : 'transparent', color: isAdmin ? '#0369a1' : 'white', border: '1px solid white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
            {isAdmin ? 'Modo Admin Activo' : 'Acceso Admin'}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a', textAlign: 'center' }}>
            ✈️ Elegí tu próxima aventura
          </h2>
          
          {loading && <p style={{ textAlign: 'center' }}>Cargando experiencias increíbles...</p>}
          {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {destinos.map((dest) => (
              <DestinoCard 
                key={dest.id}
                dest={dest}
                isAdmin={isAdmin}
                onReserva={handleOpenReserva}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteDestino}
              />
            ))}
          </div>
        </section>
      </main>

      {/* MODAL EDITAR PRECIO */}
      {isEditOpen && editDestino && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={() => setIsEditOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>

            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#0f172a' }}>✏️ Actualizar Precio</h2>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>{editDestino.nombre}</p>

            <form onSubmit={handleSavePrecio} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Nuevo Precio ({editDestino.moneda}):</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editPrecio} 
                  onChange={(e) => setEditPrecio(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: 2 }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESERVA */}
      {isReservaOpen && selectedDestino && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '480px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={handleCloseReserva} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>

            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: '#0f172a' }}>Confirmar Reserva</h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#0284c7', fontWeight: 600 }}>
  Destino: {selectedDestino.nombre} ({selectedDestino.moneda} ${Number(selectedDestino.precio).toLocaleString()})
</p>

            {reservaStatus && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: reservaStatus.type === 'success' ? '#dcfce7' : '#fee2e2', color: reservaStatus.type === 'success' ? '#166534' : '#991b1b', fontWeight: 500 }}>
                {reservaStatus.message}
              </div>
            )}

            <form onSubmit={handleReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo:</label>
                <input type="text" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required placeholder="Ej: Laura Gómez" style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Correo Electrónico:</label>
                <input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} required placeholder="laura@ejemplo.com" style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Fecha de Salida:</label>
                <input type="date" value={fechaViaje} onChange={(e) => setFechaViaje(e.target.value)} required style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseReserva} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: 2 }}>Completar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO DESTINO */}
      {isNuevoDestinoOpen && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={handleCloseNuevoDestino} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>

            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.35rem', color: '#0f172a' }}>➕ Cargar Nuevo Destino</h2>

            {crearStatus && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: crearStatus.type === 'success' ? '#dcfce7' : '#fee2e2', color: crearStatus.type === 'success' ? '#166534' : '#991b1b', fontWeight: 500 }}>
                {crearStatus.message}
              </div>
            )}

            <form onSubmit={handleCrearDestino} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>Nombre del Destino:</label>
                <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required placeholder="Ej: Ushuaia Fin del Mundo" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>Descripción:</label>
                <textarea value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} required placeholder="4 días recorriendo el Parque Nacional..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '70px', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>Moneda:</label>
                  <select value={nuevaMoneda} onChange={(e) => setNuevaMoneda(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>Precio:</label>
                  <input type="number" step="0.01" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} required placeholder="1200.00" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>URL Imagen:</label>
                <input type="url" value={nuevaImagen} onChange={(e) => setNuevaImagen(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseNuevoDestino} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: 2 }}>Guardar Destino</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '1.5rem', textAlign: 'center', fontSize: '0.875rem', borderTop: '1px solid #1e293b' }}>
        <p style={{ margin: 0 }}>
          Developed by <strong>Ghirba developments</strong> © 2026
        </p>
      </footer>

    </div>
  );
}

export default App;