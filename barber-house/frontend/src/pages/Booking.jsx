import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, cop, dayLabel } from "../api.js";
import { useCart } from "../cart.jsx";

export default function Booking() {
  const { serviceId, barberId } = useParams();
  const cart = useCart();
  const [days, setDays] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const load = () => api.availability(barberId).then((d) => { setDays(d); setDate(d[0]?.date ?? null); setTime(null); });
  useEffect(() => { load(); }, [barberId]);

  const submit = async (e) => {
    e.preventDefault(); setError("");
    const problem = cart.problem(); if (problem) return setError(problem);
    try { const r = await api.book({ serviceId, barberId, date, time, ...form, ...cart.payload() }); cart.clear(); setDone(r); }
    catch (err) { setError(err.message); load(); }
  };

  if (done) return (
    <main className="page narrow">
      <h2>Cita confirmada</h2>
      <p>{dayLabel(done.booking.date)} a las {done.booking.time}.</p>
      {done.booking.items.length > 0 && <p>Tus productos quedaron incluidos en el pedido.</p>}
      <p className="muted">{done.whatsapp ? "Te enviamos la confirmación por WhatsApp." : "No pudimos enviar el WhatsApp, pero tu cita quedó guardada."}</p>
      <Link className="btn" to="/">Ir al inicio</Link>
    </main>
  );

  const slots = days.find((d) => d.date === date)?.slots ?? [];
  return (
    <main className="page narrow">
      <h2>Elige día y hora</h2>
      {!days.length && <p className="muted">Este barbero no tiene horarios disponibles por ahora.</p>}
      <div className="chips">{days.map((d) => (
        <button key={d.date} className={d.date === date ? "chip on" : "chip"} onClick={() => { setDate(d.date); setTime(null); }}>{dayLabel(d.date)}</button>
      ))}</div>
      <div className="chips">{slots.map((h) => (
        <button key={h} className={h === time ? "chip on" : "chip"} onClick={() => setTime(h)}>{h}</button>
      ))}</div>
      {cart.items.length > 0 && (
        <p className="muted">Incluye {cart.items.map((i) => `${i.qty} x ${i.name}`).join(", ")} ({cop(cart.total)}). <Link to={`/reservar/${serviceId}/productos`}>Cambiar productos</Link></p>
      )}
      {time && (
        <form onSubmit={submit} className="form">
          <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Celular (WhatsApp)<input type="tel" inputMode="numeric" placeholder="3001234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn">Confirmar reserva</button>
        </form>
      )}
    </main>
  );
}
