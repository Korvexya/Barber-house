import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, cop } from "../api.js";
import { useCart, CartPanel } from "../cart.jsx";

export default function Products() {
  const { serviceId } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const [shop, setShop] = useState({ products: [], payments: [] });
  const [service, setService] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.shop().then(setShop).catch(() => {});
    if (serviceId) {
      api.services().then((srvs) => {
        const found = srvs.find((s) => s.id === serviceId);
        if (found) {
          setService(found);
          if (!cart.service || cart.service.id !== found.id) {
            cart.selectService(found);
          }
        }
      }).catch(() => {});
    }
  }, [serviceId]);

  const addItem = (p) => {
    cart.add(p);
  };

  const next = () => {
    const err = cart.problem();
    if (err) return setError(err);
    nav(`/reservar/${serviceId}`);
  };

  const handlePhoneChange = (val) => {
    const raw = val.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: raw }));
  };

  const order = async (e) => {
    e.preventDefault();
    setError("");
    const err = cart.problem();
    if (err) return setError(err);
    try {
      const r = await api.order({ ...cart.payload(), ...form });
      cart.clear();
      setDone(r);
    } catch (x) {
      setError(x.message);
    }
  };

  if (done) {
    return (
      <main className="content-container narrow">
        <div className="confirmation-panel">
          <h1 className="confirmation-title">Pedido recibido</h1>
          <p className="confirmation-lead">
            Hemos recibido tu pedido de productos en Barber House.
          </p>
          <div className="confirmation-note">
            {done.whatsapp ? (
              <p>Te enviamos el resumen y los datos de entrega por WhatsApp al {form.phone}.</p>
            ) : (
              <p>Tu orden fue guardada en el sistema. Nos pondremos en contacto contigo.</p>
            )}
          </div>
          <div className="confirmation-action">
            <Link className="btn-primary" to="/">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="content-container">
      {serviceId && service && (
        <div className="flow-status-banner">
          <div className="status-text">
            <span className="status-prefix">Paso 2: Complementos para tu servicio</span>
            <strong>{service.name}</strong> ({cop(service.price)})
          </div>
          <button type="button" className="btn-primary-compact" onClick={next}>
            Continuar a barbero →
          </button>
        </div>
      )}

      <div className="page-intro">
        <h1 className="page-heading">
          {serviceId ? "Productos para complementar tu servicio" : "Colección de cuidado masculino"}
        </h1>
        <p className="page-subhead">
          Ceras de acabado mate, aceites hidratantes para barba y peines antiestáticos
          elaborados en madera natural.
        </p>
      </div>

      <div className="products-catalog-grid">
        {shop.products.map((p) => {
          const inCart = cart.items.find((i) => i.id === p.id);
          return (
            <article className="product-store-item" key={p.id}>
              <div className="product-item-image">
                <img
                  src={p.photo}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src = "/img/products/ceramate.jpg";
                  }}
                />
              </div>

              <div className="product-item-info">
                <h2 className="product-item-title">{p.name}</h2>
                <p className="product-item-desc">{p.desc}</p>

                <div className="product-item-price-row">
                  <span className="product-item-cost">{cop(p.price)}</span>
                </div>

                <div className="product-item-cta-row">
                  {inCart ? (
                    <div className="clean-stepper-row">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => cart.change(p.id, -1)}
                      >
                        −
                      </button>
                      <span className="stepper-count">{inCart.qty}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => cart.change(p.id, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn-text-action"
                        onClick={cart.openCart}
                      >
                        Ver en reserva
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-select-main full-width"
                      onClick={() => addItem(p)}
                    >
                      Añadir al pedido
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Cart Panel Summary */}
      <div className="products-summary-section">
        <CartPanel payments={shop.payments} />
      </div>

      {error && (
        <div className="form-error-alert" role="alert">
          {error}
        </div>
      )}

      {serviceId ? (
        <div className="products-continue-block">
          <button type="button" className="btn-primary" onClick={next}>
            Continuar a elegir barbero →
          </button>
        </div>
      ) : cart.items.length > 0 ? (
        <div className="direct-order-box">
          <h2 className="section-title-sm">Datos para el envío o retiro</h2>
          <p className="section-sub-sm">
            Ingresa tu nombre y celular para coordinar la entrega o retiro por WhatsApp.
          </p>

          <form onSubmit={order} className="clean-booking-form">
            <div className="form-field-group">
              <label htmlFor="order-name">Nombre completo</label>
              <input
                id="order-name"
                className="clean-text-input"
                placeholder="Ej. Carlos Mendoza"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="order-phone">Celular (WhatsApp)</label>
              <div className="clean-phone-box">
                <span className="prefix-code">+57</span>
                <input
                  id="order-phone"
                  className="clean-phone-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="300 123 4567"
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={form.phone.length < 10 || !form.name.trim()}
            >
              Confirmar pedido de productos
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
