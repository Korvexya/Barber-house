const call = async (url, opts) => {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error de conexión");
  return data;
};
export const api = {
  services: () => call("/api/services"),
  barbers: () => call("/api/barbers"),
  availability: (id) => call(`/api/barbers/${id}/availability`),
  book: (body) => call("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
};
export const cop = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
export const dayLabel = (iso) => new Date(iso + "T12:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
api.shop = () => call("/api/shop");
api.order = (body) => call("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
