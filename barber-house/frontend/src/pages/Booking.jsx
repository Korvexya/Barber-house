import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, cop, dayLabel } from "../api.js";
import { useCart } from "../cart.jsx";

function format12h(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m < 10 ? "0" + m : m} ${period}`;
}

function formatFullDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Booking() {
  const { serviceId, barberId } = useParams();
  const cart = useCart();
  const [days, setDays] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [service, setService] = useState(null);
  const [barber, setBarber] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const load = () => {
    setLoading(true);
    Promise.all([
      api.availability(barberId),
      api.services(),
      api.barbers(),
    ])
      .then(([availDays, allServices, allBarbers]) => {
        setDays(availDays);
        if (availDays.length > 0 && !date) {
          setDate(availDays[0].date);
          const firstDate = new Date(availDays[0].date + "T12:00:00");
          setCurrentMonthDate(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
        }
        const s = allServices.find((x) => x.id === serviceId);
        if (s) {
          setService(s);
          if (!cart.service || cart.service.id !== s.id) {
            cart.selectService(s);
          }
        }
        const b = allBarbers.find((x) => x.id === barberId);
        if (b) {
          setBarber(b);
          cart.selectBarber(b);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [barberId, serviceId]);

  const handlePhoneChange = (val) => {
    const raw = val.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: raw }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const problem = cart.problem();
    if (problem) return setError(problem);
    if (!form.name.trim()) return setError("Escribe tu nombre completo.");
    if (form.phone.length !== 10) return setError("El número celular debe tener 10 dígitos (ej. 3001234567).");
    if (!date || !time) return setError("Elige fecha y hora para tu cita.");

    try {
      const r = await api.book({
        serviceId,
        barberId,
        date,
        time,
        name: form.name.trim(),
        phone: form.phone,
        notes: form.notes,
        ...cart.payload(),
      });
      cart.clear();
      setDone(r);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  if (done) {
    return (
      <main className="content-container narrow">
        <div className="confirmation-panel">
          <h1 className="confirmation-title">Cita confirmada</h1>
          <p className="confirmation-lead">
            Tu cita ha quedado registrada en Barber House. Te esperamos en la fecha y hora seleccionadas.
          </p>

          <div className="confirmation-receipt">
            <div className="receipt-row">
              <span className="receipt-label">Servicio</span>
              <span className="receipt-val">{service?.name || "Corte de Autor"}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Barbero</span>
              <span className="receipt-val">{barber?.name || "Master Barber"}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Fecha</span>
              <span className="receipt-val capitalize">{formatFullDate(done.booking.date)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Hora</span>
              <span className="receipt-val">{format12h(done.booking.time)}</span>
            </div>
            {done.booking.items?.length > 0 && (
              <div className="receipt-row">
                <span className="receipt-label">Productos</span>
                <span className="receipt-val">{done.booking.items.length} productos en orden</span>
              </div>
            )}
            <div className="receipt-row total-row">
              <span className="receipt-label">Total a cancelar en la barbería</span>
              <span className="receipt-total">{cop(done.booking.total)}</span>
            </div>
          </div>

          <div className="confirmation-note">
            {done.whatsapp ? (
              <p>Te hemos enviado la confirmación con los detalles y recordatorio a tu número de WhatsApp ({form.phone}).</p>
            ) : (
              <p>Tu reserva está confirmada en sistema. Ante cualquier cambio, contáctanos por WhatsApp.</p>
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

  const currentSlots = days.find((d) => d.date === date)?.slots ?? [];
  const morningSlots = currentSlots.filter((h) => parseInt(h.split(":")[0], 10) < 13);
  const afternoonSlots = currentSlots.filter((h) => parseInt(h.split(":")[0], 10) >= 13);

  // Calendar Matrix
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startCol = firstDay.getDay() - 1;
  if (startCol === -1) startCol = 6; // Mon = 0

  const totalDays = lastDay.getDate();
  const calendarDays = [];

  for (let i = 0; i < startCol; i++) {
    calendarDays.push({ type: "empty", key: `pad-${i}` });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    const dateIso = `${year}-${monthStr}-${dayStr}`;
    const dayData = days.find((x) => x.date === dateIso);
    const hasSlots = Boolean(dayData && dayData.slots.length > 0);
    const isSelected = date === dateIso;

    calendarDays.push({
      type: "day",
      dayNumber: d,
      dateIso,
      hasSlots,
      slotsCount: dayData ? dayData.slots.length : 0,
      isSelected,
      key: dateIso,
    });
  }

  const monthTitle = firstDay.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const prevMonth = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
      setCurrentMonthDate(new Date(year, month - 1, 1));
    }
  };

  return (
    <main className="content-container">
      {/* Appointment Context Strip */}
      <div className="appointment-summary-strip">
        <div className="strip-item">
          <span className="strip-label">Servicio</span>
          <strong className="strip-val">{service?.name || "Corte de Autor"}</strong>
          <span className="strip-sub">{service?.minutes || 45} min · {cop(service?.price || 35000)}</span>
        </div>

        <div className="strip-item">
          <span className="strip-label">Barbero</span>
          <strong className="strip-val">{barber?.name || "Master Barber"}</strong>
          <span className="strip-sub">{barber?.title || "Especialista"}</span>
        </div>
      </div>

      <div className="booking-layout-two-col">
        {/* LEFT COLUMN: CALENDAR & TIME SLOTS */}
        <div className="booking-schedule-col">
          <section className="schedule-section-card">
            <h2 className="section-title-sm">1. Elige la fecha</h2>
            <p className="section-sub-sm">
              Selecciona el día para consultar los turnos disponibles de {barber?.name?.split(" ")[0]}.
            </p>

            {/* Quick date selector */}
            {days.length > 0 && (
              <div className="fast-dates-row">
                <span className="fast-dates-label">Días con disponibilidad cercana:</span>
                <div className="fast-dates-scroll">
                  {days.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      className={`fast-date-chip ${d.date === date ? "selected" : ""}`}
                      onClick={() => {
                        setDate(d.date);
                        setTime(null);
                        const [y, m] = d.date.split("-").map(Number);
                        setCurrentMonthDate(new Date(y, m - 1, 1));
                      }}
                    >
                      <span className="fast-date-name">{dayLabel(d.date)}</span>
                      <span className="fast-date-slots">{d.slots.length} turnos</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clean Monthly Calendar */}
            <div className="minimalist-calendar">
              <div className="calendar-top-bar">
                <button
                  type="button"
                  className="cal-arrow-btn"
                  onClick={prevMonth}
                  aria-label="Mes anterior"
                >
                  ←
                </button>
                <span className="cal-current-month capitalize">{monthTitle}</span>
                <button
                  type="button"
                  className="cal-arrow-btn"
                  onClick={nextMonth}
                  aria-label="Mes siguiente"
                >
                  →
                </button>
              </div>

              <div className="cal-week-labels">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              <div className="cal-grid-body">
                {calendarDays.map((cell) => {
                  if (cell.type === "empty") {
                    return <div key={cell.key} className="cal-day-cell pad" />;
                  }
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={!cell.hasSlots}
                      className={`cal-day-cell day ${cell.hasSlots ? "available" : "disabled"} ${
                        cell.isSelected ? "active" : ""
                      }`}
                      onClick={() => {
                        if (cell.hasSlots) {
                          setDate(cell.dateIso);
                          setTime(null);
                        }
                      }}
                    >
                      <span>{cell.dayNumber}</span>
                      {cell.hasSlots && !cell.isSelected && <span className="avail-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {date && (
              <div className="chosen-date-notice">
                <span className="chosen-label">Fecha seleccionada:</span>
                <strong className="chosen-date capitalize">{formatFullDate(date)}</strong>
              </div>
            )}
          </section>

          {/* TIME SLOTS */}
          <section className="schedule-section-card">
            <h2 className="section-title-sm">2. Elige el turno</h2>
            <p className="section-sub-sm">
              Horarios exactos para garantizar atención sin filas.
            </p>

            {!days.length && (
              <p className="muted-notice">No hay turnos disponibles para este barbero actualmente.</p>
            )}

            {currentSlots.length === 0 ? (
              <p className="muted-notice">Selecciona un día en el calendario para ver los horarios.</p>
            ) : (
              <div className="slot-groups-container">
                {morningSlots.length > 0 && (
                  <div className="slot-period">
                    <span className="period-label">Mañana</span>
                    <div className="period-grid">
                      {morningSlots.map((h) => (
                        <button
                          key={h}
                          type="button"
                          className={`slot-chip ${h === time ? "selected" : ""}`}
                          onClick={() => setTime(h)}
                        >
                          <span className="slot-main-time">{format12h(h)}</span>
                          <span className="slot-sub-time">{h}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div className="slot-period">
                    <span className="period-label">Tarde</span>
                    <div className="period-grid">
                      {afternoonSlots.map((h) => (
                        <button
                          key={h}
                          type="button"
                          className={`slot-chip ${h === time ? "selected" : ""}`}
                          onClick={() => setTime(h)}
                        >
                          <span className="slot-main-time">{format12h(h)}</span>
                          <span className="slot-sub-time">{h}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM & BREAKDOWN */}
        <div className="booking-details-col">
          <div className="booking-card-panel">
            <h2 className="section-title-sm">Resumen de la cita</h2>

            <div className="panel-line-items">
              <div className="line-item">
                <span className="item-title">{service?.name || "Corte de Autor"}</span>
                <span className="item-cost">{cop(service?.price || 35000)}</span>
              </div>

              {cart.items.length > 0 && (
                <div className="panel-products-list">
                  <span className="products-list-head">Productos adicionales:</span>
                  {cart.items.map((i) => (
                    <div className="product-line-row" key={i.id}>
                      <span>{i.qty} × {i.name}</span>
                      <span>{cop(i.price * i.qty)}</span>
                    </div>
                  ))}
                  <Link to={`/reservar/${serviceId}/productos`} className="link-subtle">
                    Modificar productos
                  </Link>
                </div>
              )}

              {cart.items.length === 0 && (
                <div className="panel-invite">
                  <span>¿Deseas sumar cera, pomada o bálsamo?</span>
                  <Link to={`/reservar/${serviceId}/productos`} className="link-inline">
                    Ver productos para llevar
                  </Link>
                </div>
              )}

              <div className="panel-total-row">
                <span>Total estimado a pagar</span>
                <strong className="panel-total-price">
                  {cop((service?.price || 35000) + cart.productsTotal)}
                </strong>
              </div>
            </div>
          </div>

          <div className="booking-card-panel">
            <h2 className="section-title-sm">3. Datos de reserva</h2>
            <p className="section-sub-sm">
              Enviaremos el recordatorio y confirmación directa a tu celular por WhatsApp.
            </p>

            <form onSubmit={submit} className="clean-booking-form">
              <div className="form-field-group">
                <label htmlFor="name-input">Nombre completo</label>
                <input
                  id="name-input"
                  className="clean-text-input"
                  placeholder="Ej. Juan Esteban Aguirre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="phone-input">Celular (WhatsApp)</label>
                <div className="clean-phone-box">
                  <span className="prefix-code">+57</span>
                  <input
                    id="phone-input"
                    className="clean-phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="300 123 4567"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    required
                  />
                </div>
                <span className="field-hint">
                  {form.phone.length === 10
                    ? "✓ Número de 10 dígitos completado"
                    : `Ingresa 10 dígitos (${form.phone.length}/10)`}
                </span>
              </div>

              <div className="form-field-group">
                <label htmlFor="notes-input">Nota para el barbero (opcional)</label>
                <input
                  id="notes-input"
                  className="clean-text-input"
                  placeholder="Ej. Degradado medio en navaja, perfilado de cejas..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              {error && (
                <div className="form-error-alert" role="alert">
                  {error}
                </div>
              )}

              <div className="form-submit-block">
                <button
                  type="submit"
                  className="btn-primary full-width"
                  disabled={!date || !time || form.phone.length < 10 || !form.name.trim()}
                >
                  Confirmar reserva por WhatsApp
                </button>
                <span className="form-safe-note">
                  Sin pagos anticipados. Cancelas en la barbería en efectivo o transferencia.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
