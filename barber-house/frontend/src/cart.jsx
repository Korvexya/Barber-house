import { createContext, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cop } from "./api.js";

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

const EMPTY = {
  service: null, // { id, name, price, minutes, photo, badge, tagline }
  barber: null,  // { id, name, photo, specialty }
  items: [],     // [{ id, name, price, qty, photo }]
  fulfillment: "pickup",
  address: "",
  payment: "Efectivo",
  isOpen: false,
};

export function CartProvider({ children }) {
  const [s, setS] = useState(() => {
    try {
      const stored = localStorage.getItem("bh-cart-v3");
      return stored ? { ...EMPTY, ...JSON.parse(stored), isOpen: false } : EMPTY;
    } catch {
      return EMPTY;
    }
  });

  useEffect(() => {
    try {
      const toPersist = {
        service: s.service,
        barber: s.barber,
        items: s.items,
        fulfillment: s.fulfillment,
        address: s.address,
        payment: s.payment,
      };
      localStorage.setItem("bh-cart-v3", JSON.stringify(toPersist));
    } catch {}
  }, [s]);

  const serviceTotal = s.service ? s.service.price : 0;
  const productsTotal = s.items.reduce((t, i) => t + i.price * i.qty, 0);
  const total = serviceTotal + productsTotal;
  const itemCount = (s.service ? 1 : 0) + s.items.reduce((t, i) => t + i.qty, 0);

  const value = {
    ...s,
    serviceTotal,
    productsTotal,
    total,
    itemCount,
    openCart: () => setS((x) => ({ ...x, isOpen: true })),
    closeCart: () => setS((x) => ({ ...x, isOpen: false })),
    toggleCart: () => setS((x) => ({ ...x, isOpen: !x.isOpen })),
    selectService: (srv) => {
      setS((x) => ({
        ...x,
        service: srv
          ? {
              id: srv.id,
              name: srv.name,
              price: srv.price,
              minutes: srv.minutes,
              photo: srv.photo || "/img/services/corte.svg",
              tagline: srv.tagline || "",
            }
          : null,
      }));
    },
    removeService: () => setS((x) => ({ ...x, service: null, barber: null })),
    selectBarber: (b) => {
      setS((x) => ({
        ...x,
        barber: b ? { id: b.id, name: b.name, photo: b.photo, specialty: b.specialty } : null,
      }));
    },
    add: (p) => {
      setS((x) => {
        const exists = x.items.some((i) => i.id === p.id);
        const newItems = exists
          ? x.items.map((i) => (i.id === p.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i))
          : [
              ...x.items,
              {
                id: p.id,
                name: p.name,
                price: p.price,
                photo: p.photo || "/img/products/ceramate.jpg",
                qty: 1,
              },
            ];
        return { ...x, items: newItems, isOpen: true };
      });
    },
    change: (id, d) => {
      setS((x) => ({
        ...x,
        items: x.items
          .map((i) => (i.id === id ? { ...i, qty: Math.min(10, i.qty + d) } : i))
          .filter((i) => i.qty > 0),
      }));
    },
    remove: (id) => {
      setS((x) => ({
        ...x,
        items: x.items.filter((i) => i.id !== id),
      }));
    },
    set: (patch) => setS((x) => ({ ...x, ...patch })),
    clear: () => setS(EMPTY),
    problem: () => {
      if (!s.items.length) return "";
      if (!s.payment) return "Selecciona un método de pago.";
      if (s.fulfillment === "delivery" && !s.address.trim()) {
        return "Escribe la dirección de entrega.";
      }
      return "";
    },
    payload: () => ({
      items: s.items.map(({ id, qty }) => ({ id, qty })),
      fulfillment: s.fulfillment,
      address: s.address,
      payment: s.payment,
    }),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function CartDrawer() {
  const c = useCart();
  const nav = useNavigate();

  if (!c.isOpen) return null;

  const handleProceed = () => {
    c.closeCart();
    if (c.service) {
      if (c.barber) {
        nav(`/reservar/${c.service.id}/${c.barber.id}`);
      } else {
        nav(`/reservar/${c.service.id}`);
      }
    } else if (c.items.length > 0) {
      nav("/productos");
    } else {
      nav("/reservar");
    }
  };

  return (
    <div className="drawer-backdrop" onClick={c.closeCart} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="drawer-kicker">Resumen</span>
            <h2 className="drawer-title">Tu reserva y pedido</h2>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={c.closeCart}
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {/* Selected Service Section */}
          <div className="drawer-group">
            <span className="drawer-group-title">Servicio</span>
            {c.service ? (
              <div className="drawer-service-card">
                <div className="drawer-service-main">
                  <span className="drawer-service-name">{c.service.name}</span>
                  <span className="drawer-service-meta">
                    {c.service.minutes} minutos
                    {c.barber ? ` · Con ${c.barber.name}` : ""}
                  </span>
                  <span className="drawer-service-price">{cop(c.service.price)}</span>
                </div>
                <button
                  type="button"
                  className="drawer-remove-link"
                  onClick={c.removeService}
                  title="Quitar servicio"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="drawer-empty-service">
                <p>No has seleccionado un servicio de corte o barba.</p>
                <Link
                  to="/reservar"
                  className="drawer-action-link"
                  onClick={c.closeCart}
                >
                  Ver carta de servicios →
                </Link>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="drawer-group">
            <div className="drawer-group-header">
              <span className="drawer-group-title">Productos para llevar</span>
              {c.items.length > 0 && (
                <Link
                  to="/productos"
                  className="drawer-add-more"
                  onClick={c.closeCart}
                >
                  + Agregar más
                </Link>
              )}
            </div>

            {c.items.length === 0 ? (
              <p className="drawer-empty-note">
                Puedes sumar ceras, aceites o productos de cuidado para recibirlos en tu cita.
              </p>
            ) : (
              <div className="drawer-products-stack">
                {c.items.map((i) => (
                  <div className="drawer-product-row" key={i.id}>
                    <div className="drawer-product-info">
                      <span className="drawer-product-name">{i.name}</span>
                      <span className="drawer-product-unit">{cop(i.price)} cada uno</span>
                    </div>

                    <div className="drawer-qty-stepper">
                      <button
                        type="button"
                        onClick={() => c.change(i.id, -1)}
                        aria-label="Disminuir"
                      >
                        −
                      </button>
                      <span>{i.qty}</span>
                      <button
                        type="button"
                        onClick={() => c.change(i.id, 1)}
                        aria-label="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    <div className="drawer-product-total">
                      {cop(i.price * i.qty)}
                    </div>

                    <button
                      type="button"
                      className="drawer-item-del"
                      onClick={() => c.remove(i.id)}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer with Totals and Action */}
        <div className="drawer-footer">
          <div className="drawer-totals-breakdown">
            {c.service && (
              <div className="drawer-breakdown-row">
                <span>Servicio:</span>
                <span>{cop(c.serviceTotal)}</span>
              </div>
            )}
            {c.items.length > 0 && (
              <div className="drawer-breakdown-row">
                <span>Productos ({c.items.reduce((s, x) => s + x.qty, 0)}):</span>
                <span>{cop(c.productsTotal)}</span>
              </div>
            )}
            <div className="drawer-breakdown-row total">
              <span>Total a pagar en la barbería:</span>
              <strong className="drawer-total-figure">{cop(c.total)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary full-width"
            onClick={handleProceed}
            disabled={!c.service && c.items.length === 0}
          >
            {c.service
              ? c.barber
                ? "Continuar a fecha y hora →"
                : "Elegir barbero →"
              : c.items.length > 0
              ? "Confirmar orden de productos →"
              : "Ver servicios disponibles"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartPanel({ payments }) {
  const c = useCart();
  if (!c.items.length && !c.service) return null;

  const chip = (on, label, onClick) => (
    <button
      type="button"
      className={`clean-choice-chip ${on ? "selected" : ""}`}
      onClick={onClick}
      key={label}
    >
      {label}
    </button>
  );

  return (
    <section className="cart-summary-block">
      <h3 className="summary-block-title">Resumen de la orden</h3>

      {c.service && (
        <div className="summary-service-row">
          <div>
            <strong>{c.service.name}</strong>
            <p className="muted-text">{c.service.minutes} minutos</p>
          </div>
          <span className="row-price">{cop(c.service.price)}</span>
        </div>
      )}

      {c.items.length > 0 && (
        <div className="summary-items-list">
          {c.items.map((i) => (
            <div className="summary-product-item" key={i.id}>
              <span className="item-name">{i.name}</span>
              <div className="item-stepper">
                <button type="button" onClick={() => c.change(i.id, -1)}>−</button>
                <span>{i.qty}</span>
                <button type="button" onClick={() => c.change(i.id, 1)}>+</button>
              </div>
              <span className="item-line-price">{cop(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="summary-total-footer">
        <span>Total de la orden:</span>
        <strong className="total-highlight">{cop(c.total)}</strong>
      </div>

      {c.items.length > 0 && (
        <>
          <div className="choice-group">
            <span className="choice-title">Modalidad de entrega de productos:</span>
            <div className="chips-row">
              {chip(
                c.fulfillment === "pickup",
                "Retirar en la barbería (el día de tu cita)",
                () => c.set({ fulfillment: "pickup" })
              )}
              {chip(
                c.fulfillment === "delivery",
                "Envío a domicilio en Medellín",
                () => c.set({ fulfillment: "delivery" })
              )}
            </div>

            {c.fulfillment === "delivery" && (
              <div className="field-block">
                <label>Dirección completa de entrega</label>
                <input
                  className="clean-text-input"
                  placeholder="Ej. Carrera 43A # 1-50, Apto 402, El Poblado"
                  value={c.address}
                  onChange={(e) => c.set({ address: e.target.value })}
                />
              </div>
            )}
          </div>

          {payments && payments.length > 0 && (
            <div className="choice-group">
              <span className="choice-title">Método de pago preferido:</span>
              <div className="chips-row">
                {payments.map((p) =>
                  chip(c.payment === p, p, () => c.set({ payment: p }))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
