import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">🐾 RelocaPet</Link>
      <nav>
        <Link to="/">Buscar requisitos</Link>
        <Link to="/tips">Experiencias</Link>
      </nav>
    </header>
  );
}
