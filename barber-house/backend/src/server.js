import express from "express";
import cors from "cors";
import { services, barbers, bookings, products, payments, orders } from "./data.js";
import { sendWhatsApp } from "./whatsapp.js";

const app = express();
app.use(cors(), express.json());

const HOURS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const iso = (d) => d.toISOString().slice(0, 10);
const okPhone = (p) => /^3\d{9}$/.test(String(p).replace(/\D/g, ""));

class InputError extends Error { constructor(m, status = 400) { super(m); this.status = status; } }
const guard = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    if (!(e instanceof InputError)) console.error(e);
    res.status(e instanceof InputError ? e.status : 500).json({ error: e instanceof InputError ? e.message : "Error del servidor" });
  }
};
const notify = async (phone, text) => { try { await sendWhatsApp(phone, text); return true; } catch (e) { console.error(e.message); return false; } };

function availability(barber) {
  const days = [];
  for (let i = 0; days.length < 7 && i < 21; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if (!barber.days.includes(d.getDay())) continue;
    const date = iso(d);
    const slots = HOURS.filter((h) =>
      !bookings.some((b) => b.barberId === barber.id && b.date === date && b.time === h) &&
      new Date(`${date}T${h}:00`) > new Date());
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

// Valida productos, entrega y pago. Sin productos no exige nada.
function buildOrder({ items = [], fulfillment, address, payment }) {
  const lines = items.map(({ id, qty }) => {
    const p = products.find((x) => x.id === id);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 10) throw new InputError("Producto inválido");
    return { ...p, qty };
  });
  if (lines.length) {
    if (!payments.includes(payment)) throw new InputError("Elige un método de pago");
    if (!["pickup", "delivery"].includes(fulfillment)) throw new InputError("Elige domicilio o recoger");
    if (fulfillment === "delivery" && !address?.trim()) throw new InputError("Escribe la dirección de entrega");
  }
  return { lines, total: lines.reduce((s, l) => s + l.price * l.qty, 0) };
}
const describe = (o, { fulfillment, address, payment }) =>
  `${o.lines.map((l) => `${l.qty} x ${l.name}`).join(", ")} (${fulfillment === "delivery" ? `a domicilio: ${address}` : "para recoger en la barbería"}; pago: ${payment})`;

app.get("/api/services", (_, res) => res.json(services));
app.get("/api/barbers", (_, res) => res.json(barbers));
app.get("/api/shop", (_, res) => res.json({ products, payments }));
app.get("/api/barbers/:id/availability", (req, res) => {
  const b = barbers.find((x) => x.id === req.params.id);
  b ? res.json(availability(b)) : res.status(404).json({ error: "Barbero no encontrado" });
});

app.post("/api/bookings", guard(async (req, res) => {
  const { serviceId, barberId, date, time, name, phone } = req.body;
  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);
  if (!service || !barber) throw new InputError("Servicio o barbero inválido");
  if (!name?.trim() || !okPhone(phone)) throw new InputError("Escribe tu nombre y un celular colombiano de 10 dígitos");
  const order = buildOrder(req.body);
  const day = availability(barber).find((d) => d.date === date);
  if (!day?.slots.includes(time)) throw new InputError("Esa hora ya no está disponible", 409);

  const booking = { id: crypto.randomUUID(), serviceId, barberId, date, time, name: name.trim(), phone,
    items: order.lines.map(({ id, qty }) => ({ id, qty })), total: service.price + order.total };
  bookings.push(booking);
  const extra = order.lines.length ? ` Productos: ${describe(order, req.body)}.` : "";
  const whatsapp = await notify(phone, `¡Hola ${booking.name}! Tu cita en Barber House está confirmada: ${service.name} con ${barber.name}, el ${date} a las ${time}.${extra}`);
  res.status(201).json({ booking, whatsapp });
}));

app.post("/api/orders", guard(async (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim() || !okPhone(phone)) throw new InputError("Escribe tu nombre y un celular colombiano de 10 dígitos");
  const order = buildOrder(req.body);
  if (!order.lines.length) throw new InputError("Agrega al menos un producto");
  const saved = { id: crypto.randomUUID(), name: name.trim(), phone, ...order };
  orders.push(saved);
  const whatsapp = await notify(phone, `¡Hola ${saved.name}! Recibimos tu pedido en Barber House: ${describe(order, req.body)}.`);
  res.status(201).json({ order: saved, whatsapp });
}));

app.listen(process.env.PORT || 4000, () => console.log("API Barber House en :4000"));
