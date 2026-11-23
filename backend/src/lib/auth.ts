// Better Auth: usuarios, sesiones y cuentas sociales guardados en NUESTRO Mongo
// (colecciones user, session, account).
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable. Check your .env file (see .env.example).`);
  return value;
}

// Un proveedor social solo se activa si estan sus dos variables: asi se puede correr en local
// sin Google, pero en produccion hay que cargar las dos para que aparezca el login.
function socialProvider(idVar: string, secretVar: string) {
  const clientId = process.env[idVar];
  const clientSecret = process.env[secretVar];
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

const github = socialProvider("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET");
const google = socialProvider("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");

if (!github) console.warn("[auth] GitHub deshabilitado: faltan GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET");
if (!google) console.warn("[auth] Google deshabilitado: faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET");

// Better Auth usa el driver nativo de Mongo. Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

export const auth = betterAuth({
  // URL publica que ve el navegador: la del FRONT, porque /api llega al back a traves del proxy.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true, // hashea con scrypt; minimo 8 caracteres por defecto
  },
  socialProviders: {
    ...(github && { github }),
    ...(google && { google }),
  },
  // Si alguien ya registrado con email+password entra con GitHub/Google (mismo email), une las cuentas
  // en vez de tirar account_not_linked. Seguro porque ambos devuelven emails verificados.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  // admin(): agrega user.role ("user" por defecto) y los endpoints de gestion de usuarios
  // (listUsers, setRole, createUser, removeUser...) que solo puede usar un admin.
  plugins: [admin()],
});
