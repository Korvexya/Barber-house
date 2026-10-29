import { createContext, useContext, useEffect, useState } from "react";
import { cop } from "./api.js";

const Ctx = createContext();
export const useCart = () => useContext(Ctx);
const EMPTY = { items: [], fulfillment: "pickup", address: "", payment: "" };

export function CartProvider({ children }) {
  const [s, setS] = useState(() => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem("bh-cart")) }; } catch { return EMPTY; } });
  useEffect(() => { try { localStorage.setItem("bh-cart", JSON.stringify(s)); } catch {} }, [s]);
  const value = {
    ...s,
    total: s.items.reduce((t, i) => t + i.price * i.qty, 0),
    add: (p) => setS((x) => x.items.some((i) => i.id === p.id)
      ? { ...x, items: x.items.map((i) => (i.id === p.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i)) }
      : { ...x, items: [...x.items, { id: p.id, name: p.name, price: p.price, qty: 1 }] }),
    change: (id, d) => setS((x) => ({ ...x, items: x.items.map((i) => (i.id === id ? { ...i, qty: Math.min(10, i.qty + d) } : i)).filter((i) => i.qty > 0) })),
    set: (patch) => setS((x) => ({ ...x, ...patch })),
    clear: () => setS(EMPTY),
    problem: () => !s.items.length ? "" : !s.payment ? "Elige un método de pago"
      : s.fulfillment === "delivery" && !s.address.trim() ? "Escribe la dirección de entrega" : "",
    payload: () => ({ items: s.items.map(({ id, qty }) => ({ id, qty })), fulfillment: s.fulfillment, address: s.address, payment: s.payment }),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function CartPanel({ payments }) {
  const c = useCart();
  if (!c.items.length) return null;
  const chip = (on, label, onClick) => <button type="button" className={on ? "chip on" : "chip"} aria-pressed={on} onClick={onClick} key={label}>{label}</button>;
  return (
    <section className="cart">
      <h3>Tu pedido</h3>
      {c.items.map((i) => (
        <div className="line" key={i.id}>
          <span>{i.name}</span>
          <span className="qty">
            <button type="button" onClick={() => c.change(i.id, -1)} aria-label={`Quitar un ${i.name}`}>−</button>{i.qty}
            <button type="button" onClick={() => c.change(i.id, 1)} aria-label={`Agregar un ${i.name}`}>+</button>
          </span>
          <span>{cop(i.price * i.qty)}</span>
        </div>
      ))}
      <p className="price">Total productos: {cop(c.total)}</p>
      <fieldset><legend>Entrega</legend>
        <div className="chips">
          {chip(c.fulfillment === "pickup", "Recoger en la barbería", () => c.set({ fulfillment: "pickup" }))}
          {chip(c.fulfillment === "delivery", "Domicilio", () => c.set({ fulfillment: "delivery" }))}
        </div>
        {c.fulfillment === "delivery" && (
          <div className="form"><label>Dirección de entrega<input value={c.address} onChange={(e) => c.set({ address: e.target.value })} /></label></div>
        )}
      </fieldset>
      <fieldset><legend>Método de pago</legend>
        <div className="chips">{payments.map((p) => chip(c.payment === p, p, () => c.set({ payment: p })))}</div>
      </fieldset>
    </section>
  );
}
