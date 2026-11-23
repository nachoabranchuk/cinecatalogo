// Crea los usuarios de prueba (admin y user) y algunas peliculas de ejemplo. Es idempotente:
// si el usuario o la pelicula ya existen, los saltea.
//
//   npm run seed
//
// Usa el MONGODB_URI del .env. Para sembrar la base de PRODUCCION: ponerle temporalmente la URI de
// Atlas (la misma que usa Render) y correrlo una vez desde tu compu.
import "dotenv/config";
import mongoose from "mongoose";
import { auth } from "../src/lib/auth.js";
import { connectMongoDB, disconnectMongoDB } from "../src/config/db.js";
import Movie from "../src/models/Movie.js";

const ADMIN = {
  name: "Admin Peliculas",
  email: process.env.SEED_ADMIN_EMAIL || "admin@peliculas.test",
  password: process.env.SEED_ADMIN_PASSWORD || "Admin1234!",
};
const USER = {
  name: "Usuario Comun",
  email: process.env.SEED_USER_EMAIL || "user@peliculas.test",
  password: process.env.SEED_USER_PASSWORD || "User1234!",
};

// Los usuarios viven en la coleccion "user" de Better Auth (misma base que mongoose).
function usersCollection() {
  return mongoose.connection.db!.collection("user");
}

// Devuelve { id, name } del usuario; lo crea con signUpEmail si no existe y le setea el rol.
async function ensureUser(data: typeof ADMIN, role: "admin" | "user") {
  const existing = await usersCollection().findOne({ email: data.email });
  if (!existing) {
    await auth.api.signUpEmail({ body: data });
    console.log(`[seed] usuario creado: ${data.email}`);
  } else {
    console.log(`[seed] usuario ya existe: ${data.email}`);
  }
  // El rol NO se puede mandar en el registro (Better Auth lo ignora a proposito): se setea directo en la base.
  await usersCollection().updateOne({ email: data.email }, { $set: { role } });
  const user = await usersCollection().findOne({ email: data.email });
  return { id: String(user!._id), name: String(user!.name) };
}

const SAMPLE_MOVIES = [
  { title: "El secreto de sus ojos", director: "Juan Jose Campanella", genre: "Suspenso", releaseDate: "2009-08-13", durationMinutes: 129, rating: 8.2, inTheaters: false, synopsis: "Un ex agente judicial escribe una novela sobre un caso sin resolver que lo persigue hace veinticinco años." },
  { title: "Relatos salvajes", director: "Damian Szifron", genre: "Comedia", releaseDate: "2014-08-21", durationMinutes: 122, rating: 8.1, inTheaters: false, synopsis: "Seis historias sobre la venganza y la furia cotidiana." },
  { title: "Nueve reinas", director: "Fabian Bielinsky", genre: "Crimen", releaseDate: "2000-08-31", durationMinutes: 114, rating: 7.9, inTheaters: false, synopsis: "Dos estafadores se cruzan en Buenos Aires y arman un golpe imposible en un solo dia." },
  { title: "Argentina, 1985", director: "Santiago Mitre", genre: "Drama", releaseDate: "2022-09-29", durationMinutes: 140, rating: 7.8, inTheaters: false, synopsis: "El equipo de fiscales que llevo a juicio a la dictadura militar." },
  { title: "Inception", director: "Christopher Nolan", genre: "Ciencia ficcion", releaseDate: "2010-07-16", durationMinutes: 148, rating: 8.8, inTheaters: false, synopsis: "Un ladron que roba secretos a traves de los sueños recibe la tarea inversa: plantar una idea." },
  { title: "Parasite", director: "Bong Joon-ho", genre: "Suspenso", releaseDate: "2019-05-30", durationMinutes: 132, rating: 8.5, inTheaters: false, synopsis: "Una familia pobre se infiltra de a poco en la vida de una familia rica." },
  { title: "Spirited Away", director: "Hayao Miyazaki", genre: "Animacion", releaseDate: "2001-07-20", durationMinutes: 125, rating: 8.6, inTheaters: false, synopsis: "Una nena queda atrapada en un mundo de espiritus y debe rescatar a sus padres." },
  { title: "Mad Max: Fury Road", director: "George Miller", genre: "Accion", releaseDate: "2015-05-15", durationMinutes: 120, rating: 8.1, inTheaters: false, synopsis: "Una persecucion a traves del desierto postapocaliptico." },
] as const;

async function main(): Promise<void> {
  await connectMongoDB();

  const admin = await ensureUser(ADMIN, "admin");
  await ensureUser(USER, "user");

  for (const movie of SAMPLE_MOVIES) {
    const exists = await Movie.exists({ title: movie.title });
    if (exists) continue;
    await Movie.create({ ...movie, releaseDate: new Date(movie.releaseDate), createdBy: admin.id, createdByName: admin.name });
    console.log(`[seed] pelicula creada: ${movie.title}`);
  }

  console.log("\n[seed] listo. Usuarios de prueba:");
  console.log(`  admin → ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`  user  → ${USER.email} / ${USER.password}`);
}

main()
  .catch((error: unknown) => {
    console.error("[seed] fallo:", error);
    process.exitCode = 1;
  })
  .finally(() => disconnectMongoDB().then(() => process.exit()));
