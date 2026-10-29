// En producción reemplaza estos arreglos por PostgreSQL/Prisma; las rutas no cambian.
export const services = [
  { id: "corte", name: "Corte", price: 35000, minutes: 45, includes: ["Bebida de cortesía"] },
  { id: "corte-barba", name: "Corte y barba", price: 55000, minutes: 60, includes: ["Bebida de cortesía", "Masaje relajante"] },
  { id: "barba", name: "Barba", price: 25000, minutes: 30, includes: ["Bebida de cortesía", "Limpieza facial"] },
  { id: "pigmentacion", name: "Pigmentación", price: 80000, minutes: 90, includes: ["Bebida de cortesía", "Masaje relajante", "Limpieza facial"] },
];
export const barbers = [
  { id: "mateo", name: "Mateo Rivas", photo: "/img/mateo.jpg", bio: "10 años de experiencia. Especialista en fades y diseños con navaja.", days: [1, 2, 3, 4, 5, 6] },
  { id: "santiago", name: "Santiago Mora", photo: "/img/santiago.jpg", bio: "Barba clásica y toalla caliente. Trabajo pausado y preciso.", days: [2, 3, 4, 5, 6] },
  { id: "andres", name: "Andrés Gil", photo: "/img/andres.jpg", bio: "Experto en pigmentación y cortes modernos para todo tipo de cabello.", days: [1, 3, 4, 5, 6] },
];
export const bookings = [];

export const products = [
  { id: "cera-mate", name: "Cera mate", price: 28000, desc: "Fijación fuerte y acabado natural.", photo: "/img/products/ceramate.jpg" },
  { id: "pomada-brillo", name: "Pomada de brillo", price: 30000, desc: "Base agua, efecto clásico y fácil de lavar.", photo: "/img/products/pomada-brillo.jpg" },
  { id: "aceite-barba", name: "Aceite para barba", price: 35000, desc: "Suaviza e hidrata, aroma a madera.", photo: "/img/products/aceite.jpg" },
  { id: "balsamo-barba", name: "Bálsamo para barba", price: 32000, desc: "Da forma y controla el frizz.", photo: "/img/products/balsamo-barba.jpg" },
  { id: "shampoo-barba", name: "Shampoo para barba", price: 26000, desc: "Limpia sin resecar la piel.", photo: "/img/products/shampoo-barba.jpg" },
  { id: "peine", name: "Peine de madera", price: 15000, desc: "Antiestático, ideal para barba y cabello.", photo: "/img/products/peine.jpg" },
];
export const payments = ["Efectivo", "Nequi", "Daviplata", "Tarjeta", "Transferencia"];
export const orders = [];
