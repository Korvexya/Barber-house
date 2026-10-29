import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight - window.innerHeight)));
      el.style.setProperty("--dark", p);
      el.style.setProperty("--text", Math.min(1, Math.max(0, (p - 0.55) / 0.35)));
      el.style.setProperty("--intro", Math.max(0, 1 - p / 0.25));
      el.classList.toggle("ready", p > 0.6);
    };
   
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="hero" ref={ref}>
      <div className="hero-stick">
        <div className="hero-img" />
        <div className="hero-shade" />
        <div className="hero-intro">
        <p className="kicker">Barber House</p>
        <h2>Desliza y descubre Barber House</h2>
        <span className="scroll-line" aria-hidden="true" />
        </div>
        <div className="hero-copy">
          <h1>¿Listo para cambiar tu estilo y llevarlo al siguiente nivel?</h1>
          <Link to="/reservar" className="btn">Reservar</Link>
        </div>
      </div>
    </section>
  );
}
