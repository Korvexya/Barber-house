import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, cop } from "../api.js";
import { useCart } from "../cart.jsx";

export default function Services() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const cart = useCart();
  const nav = useNavigate();

  useEffect(() => {
    api.services().then(setItems).catch(() => {});
  }, []);

  const handleSelectService = (s) => {
    cart.selectService(s);
    nav(`/reservar/${s.id}/productos`);
  };

  const filteredItems = items.filter((s) => {
    if (filter === "all") return true;
    if (filter === "corte") return s.id === "corte" || s.id === "corte-barba";
    if (filter === "barba") return s.id === "barba" || s.id === "corte-barba";
    if (filter === "tratamiento") return s.id === "pigmentacion" || s.id === "corte-barba";
    return true;
  });

  return (
    <main className="content-container">
      <div className="page-intro">
        <h1 className="page-heading">Carta de servicios</h1>
        <p className="page-subhead">
          Selecciona el servicio adecuado para tu estilo. Al elegirlo, se añadirá a tu
          reserva para que continúes con la fecha, hora y barbero.
        </p>

        <div className="filter-tabs-row">
          <button
            type="button"
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "corte" ? "active" : ""}`}
            onClick={() => setFilter("corte")}
          >
            Cortes de cabello
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "barba" ? "active" : ""}`}
            onClick={() => setFilter("barba")}
          >
            Cuidado de barba
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "tratamiento" ? "active" : ""}`}
            onClick={() => setFilter("tratamiento")}
          >
            Pigmentación y combinados
          </button>
        </div>
      </div>

      <div className="services-catalog-grid">
        {filteredItems.map((s) => {
          const isSelected = cart.service?.id === s.id;
          return (
            <article
              key={s.id}
              className={`catalog-service-card ${isSelected ? "is-selected" : ""}`}
            >
              <div className="catalog-media-box">
                <img
                  src={s.photo || "/img/services/corte.svg"}
                  alt={s.name}
                  className="catalog-media-img"
                  onError={(e) => {
                    e.currentTarget.src = "/img/services/corte.svg";
                  }}
                />
                <span className="media-duration-tag">{s.minutes} minutos</span>
              </div>

              <div className="catalog-card-body">
                <div className="catalog-header-line">
                  <h2 className="catalog-service-title">{s.name}</h2>
                  <span className="catalog-service-price">{cop(s.price)}</span>
                </div>

                <p className="catalog-technique-text">{s.desc}</p>

                {s.includes && (
                  <div className="catalog-inclusions">
                    <span className="inclusions-heading">El servicio incluye:</span>
                    <ul className="inclusions-bullet-list">
                      {s.includes.map((inc) => (
                        <li key={inc}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="catalog-actions-bar">
                  <button
                    type="button"
                    className="btn-select-main"
                    onClick={() => handleSelectService(s)}
                  >
                    {isSelected ? "Servicio elegido (Continuar)" : "Elegir este servicio"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {cart.service && (
        <div className="active-selection-footer">
          <div className="selection-details">
            <span className="selection-label">Servicio en tu reserva:</span>
            <strong>{cart.service.name} ({cop(cart.service.price)})</strong>
          </div>
          <div className="selection-buttons">
            <button
              type="button"
              className="btn-text-action"
              onClick={cart.openCart}
            >
              Ver reserva
            </button>
            <Link
              to={`/reservar/${cart.service.id}/productos`}
              className="btn-primary-compact"
            >
              Continuar con la cita →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
