import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, cop } from "../api.js";

export default function Services() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.services().then(setItems); }, []);
  return (
    <main className="page">
      <h2>Elige tu servicio</h2>
      <div className="grid">
        {items.map((s) => (
          <article className="card" key={s.id}>
            <h3>{s.name}</h3>
            <ul>{s.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            <p className="muted">{s.minutes} min</p>
            <p className="price">{cop(s.price)}</p>
            <Link className="btn" to={`/reservar/${s.id}/productos`}>Elegir</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
