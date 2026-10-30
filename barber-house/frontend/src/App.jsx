import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { CartProvider, CartDrawer, useCart } from "./cart.jsx";
import { cop } from "./api.js";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Products from "./pages/Products.jsx";
import Barbers from "./pages/Barbers.jsx";
import Booking from "./pages/Booking.jsx";
import Info from "./pages/Info.jsx";

function AppContent() {
  const { pathname } = useLocation();
  const cart = useCart();
  const isHome = pathname === "/";

  // Lenis smooth scroll initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="site-wrapper">
      {/* Top Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="site-logo">
            Barber House
          </Link>

          <nav className="site-nav">
            <NavLink to="/reservar">Servicios</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/nosotros">Nosotros</NavLink>
            <NavLink to="/soporte">Soporte</NavLink>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className={`cart-trigger ${cart.itemCount > 0 ? "active" : ""}`}
              onClick={cart.toggleCart}
              aria-label="Abrir resumen de reserva"
            >
              <span>Reserva</span>
              {cart.itemCount > 0 && (
                <span className="cart-badge">{cart.itemCount}</span>
              )}
              {cart.total > 0 && (
                <span className="cart-total-badge">{cop(cart.total)}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {!isHome && (
        <div className="subnav-bar">
          <div className="subnav-inner">
            <Link to="/" className="back-home-link">
              ← Inicio
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservar" element={<Services />} />
          <Route path="/reservar/:serviceId/productos" element={<Products />} />
          <Route path="/reservar/:serviceId" element={<Barbers />} />
          <Route path="/reservar/:serviceId/:barberId" element={<Booking />} />
          <Route path="/productos" element={<Products />} />
          <Route
            path="/nosotros"
            element={
              <Info
                title="Sobre Barber House"
                text="Barber House nació con una premisa clara: devolverle a la barbería su carácter pausado, preciso y confidencial. Aquí cada cliente recibe una atención individualizada, café de origen o cerveza artesanal, y el trabajo minucioso de profesionales dedicados al oficio tradicional con criterio moderno."
              />
            }
          />
          <Route
            path="/soporte"
            element={
              <Info
                title="Atención y Modificaciones"
                text="¿Requieres reagendar, modificar la hora o cancelar tu cita? Puedes escribirnos directamente a nuestra línea oficial de WhatsApp (+57 300 123 4567) o responder al mensaje de confirmación que recibiste al reservar."
              />
            }
          />
        </Routes>
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
