import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, cop } from "../api.js";
import { useCart, CartPanel } from "../cart.jsx";

export default function Products() {
  const { serviceId } = useParams(); // si existe, estamos dentro del flujo de reserva
  const nav = useNavigate();
  const cart = useCart();
  const cartRef = useRef(null);
const addItem = (p) => {
  cart.add(p);
  setTimeout(() => cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
};
  const [shop, setShop] = useState({ products: [], payments: [] });
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  useEffect(() => { api.shop().then(setShop); }, []);

  const next = () => { const err = cart.problem(); err ? setError(err) : nav(`/reservar/${serviceId}`); };
  const order = async (e) => {
    e.preventDefault(); setError("");
    const err = cart.problem(); if (err) return setError(err);
    try { const r = await api.order({ ...cart.payload(), ...form }); cart.clear(); setDone(r); }
    catch (x) { setError(x.message); }
  };

  if (done) return (
    <main className="page narrow">
      <h2>Pedido recibido</h2>
      <p className="muted">{done.whatsapp ? "Te enviamos el resumen por WhatsApp." : "No pudimos enviar el WhatsApp, pero tu pedido quedó guardado."}</p>
      <Link className="btn" to="/">Ir al inicio</Link>
    </main>
  );

  return (
    <main className="page">
      <h2>{serviceId ? "¿Quieres sumar algo a tu servicio?" : "Productos"}</h2>
      <div className="grid">
        {shop.products.map((p) => (
          <article className="card" key={p.id}>
            <div className="thumb"><img src={p.photo} alt={p.name} onError={(e) => (e.currentTarget.style.display = "none")} /></div>
            <h3>{p.name}</h3>
            <p className="muted">{p.desc}</p>
            <p className="price">{cop(p.price)}</p>
            <button className="btn" onClick={() => addItem(p)}>Agregar</button>
          </article>
        ))}
      </div>
     <div ref={cartRef} className="cart-anchor"><CartPanel payments={shop.payments} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      {serviceId ? (
        <button className="btn go" onClick={next}>Continuar</button>
      ) : cart.items.length > 0 && (
        <form className="form cart" onSubmit={order}>
          <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Celular (WhatsApp)<input type="tel" inputMode="numeric" placeholder="3001234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
          <button className="btn">Hacer pedido</button>
        </form>
      )}
    </main>
  );
}
