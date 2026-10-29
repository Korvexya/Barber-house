import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function Barbers() {
  const { serviceId } = useParams();
  const [items, setItems] = useState([]);
  useEffect(() => { api.barbers().then(setItems); }, []);
  return (
    <main className="page">
      <h2>Elige tu barbero</h2>
      <div className="grid">
        {items.map((b) => (
          <article className="card" key={b.id}>
            <img className="photo" src={b.photo} alt={b.name} />
            <h3>{b.name}</h3>
            <p className="muted">{b.bio}</p>
            <Link className="btn" to={`/reservar/${serviceId}/${b.id}`}>Reservar</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
