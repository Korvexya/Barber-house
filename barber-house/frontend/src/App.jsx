import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { CartProvider } from "./cart.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Products from "./pages/Products.jsx";
import Barbers from "./pages/Barbers.jsx";
import Booking from "./pages/Booking.jsx";
import Info from "./pages/Info.jsx";

export default function App() {
  const { pathname } = useLocation();
  const inner = pathname !== "/";
  return (
    <CartProvider>
      {inner && <div className="bg-art" aria-hidden="true" />}
      <header className="nav">
        <Link to="/" className="logo">Barber House</Link>
        <nav>
          <NavLink to="/reservar">Servicios</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>
          <NavLink to="/soporte">Soporte</NavLink>
        </nav>
      </header>
      {inner && <Link to="/" className="home-btn">Ir al inicio</Link>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservar" element={<Services />} />
        <Route path="/reservar/:serviceId/productos" element={<Products />} />
        <Route path="/reservar/:serviceId" element={<Barbers />} />
        <Route path="/reservar/:serviceId/:barberId" element={<Booking />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/nosotros" element={<Info title="Nosotros" text="Barber House es un espacio para cuidarte con calma: buen corte, buena barba y buen rato." />} />
        <Route path="/soporte" element={<Info title="Soporte" text="¿Necesitas cambiar o cancelar una cita? Escríbenos por WhatsApp y te ayudamos." />} />
      </Routes>
    </CartProvider>
  );
}
