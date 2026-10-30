// En producción reemplaza estos arreglos por PostgreSQL/Prisma; las rutas no cambian.
export const services = [
  {
    id: "corte",
    name: "Corte de Autor",
    tagline: "Skin Fade · Clásico · Tijera",
    desc: "Corte personalizado según tu morfología craneal y estilo. Incluye degradado de alta precisión (low, mid o high fade), tijera superior, lavado y peinado con fijación mate.",
    price: 35000,
    minutes: 45,
    photo: "/img/services/corte.svg",
    badge: "Esencial",
    includes: ["Asesoría de visagismo", "Lavado con shampoo revitalizante", "Perfilado de contornos con navaja", "Bebida de cortesía (café o cerveza)"]
  },
  {
    id: "corte-barba",
    name: "Corte y Barba Ritual VIP",
    tagline: "El ritual completo para caballeros",
    desc: "Nuestra experiencia insignia: corte de cabello de alta precisión y ritual completo de barba con toalla caliente al vapor, perfilado tradicional a navaja y masaje facial.",
    price: 55000,
    minutes: 60,
    photo: "/img/services/corte-barba.svg",
    badge: "Más Solicitado",
    includes: ["Corte y degradado completo", "Toalla caliente con aromaterapia", "Perfilado con navaja tradicional", "Masaje facial y capilar relajante", "Bebida de cortesía"]
  },
  {
    id: "barba",
    name: "Perfilado y Ritual de Barba",
    tagline: "Toalla caliente & navaja artesanal",
    desc: "Cuidado profesional para tu barba: rebaje uniforme, diseño de líneas con simetría milimétrica, apertura de poros con toalla caliente y aceites esenciales hidratantes.",
    price: 25000,
    minutes: 30,
    photo: "/img/services/barba.svg",
    badge: "Cuidado Barba",
    includes: ["Toalla caliente al vapor", "Exfoliación suave", "Perfilado con navaja de barbero", "Aceite aromático y bálsamo", "Bebida de cortesía"]
  },
  {
    id: "pigmentacion",
    name: "Pigmentación Capilar & Barba",
    tagline: "Definición máxima y cobertura",
    desc: "Técnica semi-permanente con aerógrafo para marcar líneas de cabello nítidas y rellenar zonas poco pobladas de la barba o entradas, logrando un aspecto uniforme y pulcro.",
    price: 80000,
    minutes: 90,
    photo: "/img/services/pigmentacion.svg",
    badge: "Especializado",
    includes: ["Diseño y simetría milimétrica", "Aplicación con aerógrafo profesional", "Fijador de larga duración", "Bebida de cortesía", "Limpieza facial previa"]
  },
];

export const barbers = [
  {
    id: "mateo",
    name: "Mateo Rivas",
    title: "Master Barber",
    photo: "/img/barbers/mateo.svg",
    bio: "10 años de experiencia. Especialista en fades milimétricos, tijera de textura y diseños geométricos con navaja.",
    rating: "4.9",
    specialty: "Skin Fade & Diseños",
    days: [1, 2, 3, 4, 5, 6]
  },
  {
    id: "santiago",
    name: "Santiago Mora",
    title: "Senior Beard Craftsman",
    photo: "/img/barbers/santiago.svg",
    bio: "Especialista en barba clásica tradicional, toalla caliente y tratamientos de cuidado de la piel. Trabajo pausado y preciso.",
    rating: "5.0",
    specialty: "Barba Clásica & Navaja",
    days: [2, 3, 4, 5, 6]
  },
  {
    id: "andres",
    name: "Andrés Gil",
    title: "Hair Artist & Stylist",
    photo: "/img/barbers/andres.svg",
    bio: "Experto en pigmentación semipermanente con aerógrafo, cortes urbanos de tendencia y texturizados modernos.",
    rating: "4.9",
    specialty: "Pigmentación & Tendencias",
    days: [1, 3, 4, 5, 6]
  },
];

export const bookings = [];

export const products = [
  { id: "cera-mate", name: "Cera mate Barber House", price: 28000, desc: "Fijación fuerte y acabado natural sin brillo.", photo: "/img/products/ceramate.jpg" },
  { id: "pomada-brillo", name: "Pomada de brillo clásico", price: 30000, desc: "Base agua, fijación media y fácil de lavar.", photo: "/img/products/pomada-brillo.svg" },
  { id: "aceite-barba", name: "Aceite premium para barba", price: 35000, desc: "Suaviza e hidrata, aroma a cedro y madera.", photo: "/img/products/aceite.jpg" },
  { id: "balsamo-barba", name: "Bálsamo modelador de barba", price: 32000, desc: "Da forma, acondiciona y controla el frizz.", photo: "/img/products/balsamo-barba.svg" },
  { id: "shampoo-barba", name: "Shampoo purificante barba", price: 26000, desc: "Limpia a profundidad sin resecar la piel.", photo: "/img/products/shampoo-barba.svg" },
  { id: "peine", name: "Peine de madera artesanal", price: 15000, desc: "Antiestático, ideal para barba y cabello.", photo: "/img/products/peine.svg" },
];

export const payments = ["Efectivo", "Nequi", "Daviplata", "Tarjeta", "Transferencia Bancaria"];
export const orders = [];
