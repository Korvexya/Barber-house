import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, cop } from "../api.js";
import { useCart } from "../cart.jsx";

export default function Home() {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [products, setProducts] = useState([]);
  const cart = useCart();
  const nav = useNavigate();

  useEffect(() => {
    api.services().then(setServices).catch(() => {});
    api.barbers().then(setBarbers).catch(() => {});
    api.shop().then((d) => setProducts(d.products || [])).catch(() => {});
  }, []);

  const handleSelectService = (s) => {
    cart.selectService(s);
    nav(`/reservar/${s.id}/productos`);
  };

  const handleSelectBarber = (b) => {
    const defaultService = services[0] || { id: "corte", name: "Corte de Autor", price: 35000, minutes: 45 };
    cart.selectService(defaultService);
    cart.selectBarber(b);
    nav(`/reservar/${defaultService.id}/${b.id}`);
  };

  return (
    <div className="home-editorial">
      {/* HERO SECTION: Editorial split */}
      <section className="editorial-hero">
        <div className="hero-text-side">
          <h1 className="hero-heading">
            Barbería clásica, técnica contemporánea.
          </h1>

          <p className="hero-statement">
            Un espacio dedicado al cuidado masculino sin prisas. Cortes de alta
            precisión a tijera y máquina, rituales de barba con toalla caliente y atención
            personalizada con café de origen o cerveza de cortesía.
          </p>

          <div className="hero-actions-row">
            <Link to="/reservar" className="btn-primary">
              Reservar cita
            </Link>
            <a href="#servicios" className="btn-link">
              Ver carta de servicios ↓
            </a>
          </div>

          <div className="hero-practical-info">
            <div className="info-block">
              <span className="info-label">Horario de atención</span>
              <span className="info-value">Lunes a sábado · 10:00 a 19:00</span>
            </div>
            <div className="info-block">
              <span className="info-label">Ubicación</span>
              <span className="info-value">Carrera 43A # 1 Sur - 150, El Poblado</span>
            </div>
          </div>
        </div>

        <div className="hero-visual-side">
          <div className="hero-frame">
            <img
              src="/img/hero.jpg"
              alt="Barbero trabajando con toalla caliente y navaja"
              className="hero-image"
            />
            <div className="hero-image-caption">
              Atención pausada e individual por turno programado
            </div>
          </div>
        </div>
      </section>

      {/* CARTA DE SERVICIOS */}
      <section id="servicios" className="editorial-section">
        <div className="section-head">
          <h2 className="section-headline">Carta de servicios</h2>
          <p className="section-intro">
            Cada servicio incluye asesoría de visagismo según tu tipo de rostro,
            lavado capilar y bebida de cortesía.
          </p>
        </div>

        <div className="services-editorial-list">
          {services.map((s) => (
            <article className="service-row-item" key={s.id}>
              <div className="service-visual-col">
                <img
                  src={s.photo || "/img/services/corte.svg"}
                  alt={s.name}
                  className="service-thumb"
                  onError={(e) => {
                    e.currentTarget.src = "/img/services/corte.svg";
                  }}
                />
              </div>

              <div className="service-main-col">
                <div className="service-title-row">
                  <h3 className="service-name">{s.name}</h3>
                  <div className="service-price-meta">
                    <span className="service-duration">{s.minutes} min</span>
                    <span className="service-price">{cop(s.price)}</span>
                  </div>
                </div>

                <p className="service-description">{s.desc}</p>

                {s.includes && (
                  <ul className="service-includes-inline">
                    {s.includes.map((inc) => (
                      <li key={inc}>{inc}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="service-action-col">
                <button
                  type="button"
                  className="btn-select"
                  onClick={() => handleSelectService(s)}
                >
                  Seleccionar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FILOSOFÍA DEL OFICIO */}
      <section className="editorial-section tone-warm">
        <div className="craft-grid">
          <div className="craft-text">
            <h2 className="section-headline">El oficio de la tijera y la navaja</h2>
            <p className="craft-paragraph">
              En Barber House no creemos en el corte estandarizado ni en las prisas.
              Cada cliente tiene una morfología craneal, un nacimiento capilar y una textura
              única. Por ello, comenzamos cada sesión analizando tus rasgos y escuchando
              exactamente qué buscas proyectar.
            </p>
            <p className="craft-paragraph">
              Trabajamos con navajas tradicionales de un solo filo, toallas infusionadas con
              esencias botánicas para abrir los poros sin irritar la piel, y bálsamos
              elaborados con aceites naturales de cedro y romero.
            </p>
          </div>

          <div className="craft-specs">
            <div className="spec-item">
              <h4>Visagismo aplicado</h4>
              <p>Diseño geométrico adaptado a las proporciones de tu rostro y mandíbula.</p>
            </div>
            <div className="spec-item">
              <h4>Toalla caliente al vapor</h4>
              <p>Apertura de poros y suavizado de barba para un afeitado al ras sin tirones.</p>
            </div>
            <div className="spec-item">
              <h4>Puntualidad rigurosa</h4>
              <p>Tu turno inicia a la hora pactada. Tu tiempo tiene el mismo valor que el nuestro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EL EQUIPO DE BARBEROS */}
      <section className="editorial-section">
        <div className="section-head">
          <h2 className="section-headline">El equipo</h2>
          <p className="section-intro">
            Barberos con trayectoria demostrada y dominio técnico en cortes clásicos y modernos.
          </p>
        </div>

        <div className="barbers-editorial-grid">
          {barbers.map((b) => (
            <article className="barber-editorial-card" key={b.id}>
              <div className="barber-portrait-box">
                <img
                  src={b.photo || "/img/barbers/mateo.svg"}
                  alt={b.name}
                  className="barber-portrait"
                  onError={(e) => {
                    e.currentTarget.src = "/img/barbers/mateo.svg";
                  }}
                />
              </div>

              <div className="barber-editorial-body">
                <span className="barber-role">{b.title || "Master Barber"}</span>
                <h3 className="barber-title-name">{b.name}</h3>
                <p className="barber-biography">{b.bio}</p>
                <span className="barber-days-tag">Atención de lunes a sábado</span>

                <button
                  type="button"
                  className="btn-select-barber"
                  onClick={() => handleSelectBarber(b)}
                >
                  Agendar con {b.name.split(" ")[0]}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TIENDA DE CUIDADO PERSONAL */}
      <section className="editorial-section tone-subtle">
        <div className="section-head">
          <h2 className="section-headline">Cuidado personal</h2>
          <p className="section-intro">
            Fórmulas desarrolladas para mantener el acabado del corte y la salud de la piel entre visitas.
          </p>
        </div>

        <div className="products-editorial-grid">
          {products.slice(0, 4).map((p) => (
            <article className="product-editorial-card" key={p.id}>
              <div className="product-image-wrap">
                <img
                  src={p.photo}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src = "/img/products/ceramate.jpg";
                  }}
                />
              </div>
              <div className="product-card-details">
                <h4 className="product-name">{p.name}</h4>
                <p className="product-summary">{p.desc}</p>
                <div className="product-bottom-line">
                  <span className="product-price">{cop(p.price)}</span>
                  <button
                    type="button"
                    className="btn-add-product"
                    onClick={() => cart.add(p)}
                  >
                    Añadir al pedido
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="section-bottom-action">
          <Link to="/productos" className="btn-link">
            Explorar toda la colección de productos →
          </Link>
        </div>
      </section>

      {/* UBICACIÓN Y RESERVA DIRECTA */}
      <section className="editorial-section location-editorial">
        <div className="location-box">
          <div className="location-content">
            <h2 className="section-headline">Visítanos en El Poblado</h2>
            <p className="location-paragraph">
              Estamos ubicados en una zona accesible con parqueadero para clientes y sala de espera con café espresso y cerveza fría.
            </p>

            <div className="location-data-grid">
              <div>
                <strong>Dirección</strong>
                <p>Carrera 43A # 1 Sur - 150, El Poblado, Medellín</p>
              </div>
              <div>
                <strong>Horario regular</strong>
                <p>Lunes a sábado: 10:00 – 19:00</p>
              </div>
              <div>
                <strong>Contacto telefónico</strong>
                <p>+57 300 123 4567</p>
              </div>
            </div>

            <div className="location-actions">
              <Link to="/reservar" className="btn-primary">
                Agendar cita en línea
              </Link>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Escribir a WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="editorial-footer">
        <div className="footer-container">
          <div className="footer-col-main">
            <span className="footer-brand-title">Barber House</span>
            <p className="footer-brand-desc">
              Taller de barbería masculina, perfilado de barba y cuidado personal. Medellín, Colombia.
            </p>
          </div>

          <div className="footer-col-nav">
            <span className="footer-nav-label">Navegación</span>
            <Link to="/reservar">Servicios</Link>
            <Link to="/productos">Tienda</Link>
            <Link to="/nosotros">El Taller</Link>
            <Link to="/soporte">Atención</Link>
          </div>

          <div className="footer-col-nav">
            <span className="footer-nav-label">Servicios</span>
            <Link to="/reservar">Corte de Autor</Link>
            <Link to="/reservar">Corte y Barba</Link>
            <Link to="/reservar">Ritual de Barba</Link>
            <Link to="/reservar">Pigmentación</Link>
          </div>
        </div>

        <div className="footer-legal">
          <p>© {new Date().getFullYear()} Barber House. Todos los derechos reservados.</p>
          <p>Citas confirmadas por sistema y coordinadas vía WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
