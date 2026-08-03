import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Buscador from './pages/Buscador';
import Tips from './pages/Tips';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Buscador />} />
          <Route path="/tips" element={<Tips />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
