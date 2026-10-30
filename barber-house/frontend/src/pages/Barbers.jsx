import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, cop } from "../api.js";
import { useCart } from "../cart.jsx";

export default function Barbers() {
  const { serviceId } = useParams();
  const [items, setItems] = useState([]);
  const [service, setService] = useState(null);
  const cart = useCart();
  const nav = useNavigate();

  useEffect(() => {
    api.barbers().then(setItems).catch(() => {});
    api.services().then((srvs) => {
      const found = srvs.find((s) => s.id === serviceId);
      if (found) {
        setService(found);
        if (!cart.service || cart.service.id !== found.id) {
          cart.selectService(found);
        }
      }
    }).catch(() => {});
  }, [serviceId]);

  const handleSelectBarber = (b) => {
    cart.selectBarber(b);
    nav(`/reservar/${serviceId}/${b.id}`);
  };

  return (
    <main className="content-container">
      {service && (
        <div className="flow-status-banner">
          <div className="status-text">
            <span className="status-prefix">Servicio seleccionado:</span>
            <strong>{service.name}</strong> · {service.minutes} min · {cop(service.price)}
          </div>
          <Link to="/reservar" className="status-change-link">
            Cambiar servicio
          </Link>
        </div>
      )}

      <div className="page-intro">
        <h1 className="page-heading">Selecciona a tu barbero</h1>
        <p className="page-subhead">
          Elige al profesional con quien deseas realizar tu cita. Cada barbero cuenta con
          horarios y turnos asignados para brindarte atención puntual.
        </p>
      </div>

      <div className="barbers-catalog-grid">
        {items.map((b) => (
          <article className="barber-profile-card" key={b.id}>
            <div className="barber-portrait-frame">
              <img
                src={b.photo || "/img/barbers/mateo.svg"}
                alt={b.name}
                className="barber-profile-photo"
                onError={(e) => {
                  e.currentTarget.src = "/img/barbers/mateo.svg";
                }}
              />
            </div>

            <div className="barber-profile-details">
              <span className="profile-role">{b.title || "Master Barber"}</span>
              <h2 className="profile-name">{b.name}</h2>
              <p className="profile-bio">{b.bio}</p>

              <div className="profile-schedule-note">
                Turnos disponibles de lunes a sábado
              </div>

              <button
                type="button"
                className="btn-select-main"
                onClick={() => handleSelectBarber(b)}
              >
                Agendar con {b.name.split(" ")[0]}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
