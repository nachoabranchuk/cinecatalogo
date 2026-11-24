# 🎬 CineCatalogo

Aplicación full stack para explorar y administrar un **catálogo de películas**. Cualquier visitante puede ver el catálogo; los usuarios registrados cargan sus propias películas y los administradores gestionan todo el contenido y los usuarios.

**Stack:** Node.js + Express 5 + TypeScript · MongoDB + Mongoose · Better Auth (email/contraseña, GitHub y Google) · Zod · LangChain + Groq · React 19 + Vite + TypeScript · React Router · React Hook Form + Zod · Redux Toolkit (RTK Query) · Tailwind CSS · Render.

## 🔗 URLs en producción

| Servicio | URL |
| --- | --- |
| Frontend (Static Site) | `https://cinecatalogo-web.onrender.com`  |
| Backend (Web Service) | `https://cinecatalogo-api-gt9z.onrender.com` |

> El frontend no llama al backend por su URL: usa `/api` y Render lo reenvía al backend con un _rewrite_ (ver [Deploy](#-deploy-en-render)). Ojo: Render gratuito "duerme" el backend tras un rato sin uso, así que la primera request puede tardar ~50 segundos.

## 🔑 Usuarios de prueba (para la corrección)

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@peliculas.test` | `Admin1234!` |
| user | `user@peliculas.test` | `User1234!` |

Se crean con `npm run seed` (ver más abajo). Quien se registra por su cuenta siempre recibe el rol `user`.

## 🎞️ La entidad: Película

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `title` | texto | obligatorio, máx. 150 |
| `director` | texto | obligatorio, máx. 100 |
| `genre` | texto (lista cerrada) | Accion, Aventura, Animacion, Comedia, Crimen, Documental, Drama, Fantasia, Terror, Romance, Ciencia ficcion, Suspenso |
| `releaseDate` | **fecha** | obligatoria, formato `AAAA-MM-DD` |
| `durationMinutes` | **número** (entero) | 1 a 600 |
| `rating` | **número** | 0 a 10 |
| `inTheaters` | **booleano** | opcional, por defecto `false` |
| `synopsis` | texto | opcional, máx. 1000 |
| `posterUrl` | texto (URL) | opcional |
| `createdBy`, `createdByName` | texto | los asigna el **servidor** con el usuario de la sesión; el cliente no puede enviarlos |

## 👥 Roles y permisos

| Acción | Visitante | `user` | `admin` |
| --- | :---: | :---: | :---: |
| Ver catálogo y detalle | ✅ | ✅ | ✅ |
| Buscar, filtrar, ordenar y paginar | ✅ | ✅ | ✅ |
| Crear películas (quedan a su nombre) | ❌ | ✅ | ✅ |
| Editar / eliminar películas | ❌ | solo las **suyas** | **todas** |
| Usar el asistente (agente LangChain) | ❌ | ✅ | ✅ |
| Panel de administración (`/admin`) | ❌ | ❌ (ve "Sin permisos") | ✅ |
| Crear usuarios, cambiar roles y eliminar usuarios | ❌ | ❌ | ✅ |

Los permisos se hacen cumplir **en el backend** (`authMiddleware` + `requireRole` + chequeo de dueño). El frontend solo oculta o redirige por comodidad.

## 🛣️ Endpoints de la API

Todos los errores tienen el mismo formato: `{ "error": { "message": "...", "details": { "campo": ["..."] } } }` (`details` solo aparece en los 400 de validación).

| Método | Ruta | Rol requerido | Descripción |
| --- | --- | --- | --- |
| GET | `/api/movies` | público | Listado paginado. Query: `page`, `limit`, `search`, `genre`, `inTheaters`, `sortBy`, `sortOrder`, `mine` |
| GET | `/api/movies/:id` | público | Detalle (400 si el id es inválido, 404 si no existe) |
| POST | `/api/movies` | `user` o `admin` | Crea una película a nombre del usuario de la sesión (201) |
| PUT | `/api/movies/:id` | `admin` (cualquiera) / `user` (solo las suyas) | Reemplazo completo (valida todos los campos) |
| PATCH | `/api/movies/:id` | `admin` (cualquiera) / `user` (solo las suyas) | Cambios parciales |
| DELETE | `/api/movies/:id` | `admin` (cualquiera) / `user` (solo las suyas) | Elimina (204) |
| POST | `/api/agent/chat` | `user` o `admin` (sesión) | Chat con el agente; responde por Server-Sent Events |
| GET | `/api/health` | público | Estado del servidor |
| POST | `/api/auth/sign-up/email` | público | Registro (siempre rol `user`) |
| POST | `/api/auth/sign-in/email` | público | Login con email y contraseña |
| POST | `/api/auth/sign-in/social` | público | Inicia login con GitHub o Google |
| GET | `/api/auth/get-session` | público | Devuelve la sesión actual (o `null`) |
| POST | `/api/auth/sign-out` | sesión | Cierra la sesión (se borra de la base) |
| GET | `/api/auth/admin/list-users` | `admin` | Lista usuarios |
| POST | `/api/auth/admin/set-role` | `admin` | Cambia el rol de un usuario |
| POST | `/api/auth/admin/create-user` | `admin` | Crea un usuario con el rol elegido |
| POST | `/api/auth/admin/remove-user` | `admin` | Elimina un usuario |

Las rutas `/api/auth/*` las implementa Better Auth (plugin `admin`); solo se listan las que usa la app.

**Códigos HTTP:** `200` OK · `201` creado · `204` eliminado · `400` datos inválidos (Zod) o id mal formado · `401` sin sesión · `403` sin permisos (ej: un `user` intentando editar una película ajena) · `404` no existe · `500` error interno.

### Ejemplos

```bash
# Listado público: películas de suspenso, mejor puntuadas primero, página 1
curl "https://TU-FRONTEND.onrender.com/api/movies?genre=Suspenso&sortBy=rating&sortOrder=desc&page=1&limit=12"

# Sin sesión → 401
curl -X POST https://TU-FRONTEND.onrender.com/api/movies -H "Content-Type: application/json" -d '{}'
```

## 🧠 Asistente con LangChain (opcional)

En `/asistente` hay un chat con un agente (LangChain + Groq) que consulta y modifica el catálogo con lenguaje natural. Tiene 4 _tools_ que usan el **mismo servicio y las mismas reglas de permisos** que la API REST:

| Tool | Qué hace | Permisos |
| --- | --- | --- |
| `list_movies` | Busca/filtra/ordena (ej: "las mejores de suspenso") | cualquier sesión |
| `get_movie_by_id` | Trae el detalle de una película | cualquier sesión |
| `create_movie` | Crea una película a nombre del usuario | cualquier sesión |
| `delete_movie` | Elimina una película | dueño o `admin` |

El usuario sale de la **sesión** (nunca del mensaje) y el chequeo de permisos está dentro de la tool, así que no se puede saltear con un prompt ingenioso.

## 💻 Correrlo en local

**Requisitos:** Node 22+, una base MongoDB (Atlas gratis sirve) y, para el login social y el asistente, las credenciales de la sección siguiente.

```bash
# 1) Backend (puerto 3000)
cd backend
cp .env.example .env     # completar las variables (tabla de abajo)
npm install
npm run seed             # crea admin + user de prueba y películas de ejemplo
npm run dev

# 2) Frontend (puerto 5173), en otra terminal
cd frontend
npm install
npm run dev
```

Abrir <http://localhost:5173>. El frontend usa un proxy de Vite (`/api` → `http://localhost:3000`), así que no hace falta CORS y la cookie de sesión es del mismo origen.

> Los comandos `npm` se corren dentro de `backend/` o `frontend/`, no en la raíz.

### Variables de entorno (`backend/.env`)

El archivo `backend/.env.example` tiene todas, sin valores reales. **Nunca se commitea el `.env`.**

| Variable | Obligatoria | Descripción |
| --- | :---: | --- |
| `MONGODB_URI` | ✅ | URI de Mongo **con el nombre de la base**: `mongodb+srv://USER:PASS@cluster.mongodb.net/peliculas` |
| `BETTER_AUTH_SECRET` | ✅ | Secreto para firmar sesiones. Generar con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | ✅ | URL pública del **frontend**. Local: `http://localhost:5173` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | para GitHub | OAuth App de GitHub |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | para Google | Credencial OAuth de Google Cloud |
| `GROQ_API_KEY` | para el asistente | Key gratis en <https://console.groq.com/keys> |
| `GROQ_MODEL` | no | Modelo de Groq con tool calling (default `openai/gpt-oss-20b`) |
| `PORT` | no | Default `3000` (Render lo inyecta solo) |
| `NODE_ENV` | no | `development` / `production` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` | no | Solo para `npm run seed`; hay valores por defecto |

Si faltan las variables de GitHub o Google, ese proveedor queda deshabilitado y el servidor avisa por consola al arrancar.

### Configurar el login social

El callback de cada proveedor apunta al **frontend** (el proxy / rewrite lo reenvía al backend):

| Proveedor | Dónde se crea | Homepage / origen | Callback (redirect URI) |
| --- | --- | --- | --- |
| GitHub (local) | GitHub → Settings → Developer settings → OAuth Apps | `http://localhost:5173` | `http://localhost:5173/api/auth/callback/github` |
| GitHub (prod) | otra OAuth App distinta | `https://TU-FRONTEND.onrender.com` | `https://TU-FRONTEND.onrender.com/api/auth/callback/github` |
| Google | [Google Cloud Console](https://console.cloud.google.com/) → APIs y servicios → Credenciales → ID de cliente OAuth (Aplicación web) | local y prod en _Orígenes autorizados_ | `http://localhost:5173/api/auth/callback/google` **y** `https://TU-FRONTEND.onrender.com/api/auth/callback/google` |

Una OAuth App de GitHub acepta **una sola** callback, por eso hacen falta dos (local y producción). Google acepta varias URIs en la misma credencial.

> **Google para que entre cualquier persona:** en _Pantalla de consentimiento de OAuth_ (o _Google Auth Platform → Público_) hay que pasar la app de **"Prueba" a "En producción"**. En modo prueba solo pueden entrar las cuentas agregadas a mano como usuarios de prueba. Con los permisos básicos (email y perfil) no hace falta verificación de Google.

## 🚀 Deploy en Render

Se necesitan **dos servicios** en el mismo repo. Primero, en MongoDB Atlas: _Network Access → Add IP Address → `0.0.0.0/0`_ (las IPs de Render cambian y no se pueden listar).

### 1) Backend → Web Service

| Campo | Valor |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |

`--include=dev`: con `NODE_ENV=production` npm saltea las devDependencies y el build falla con `tsc: not found`.

Variables de entorno: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (= URL del **frontend**), `GITHUB_CLIENT_ID/SECRET` (los de la OAuth App de **producción**), `GOOGLE_CLIENT_ID/SECRET`, `GROQ_API_KEY`. `PORT` no se configura.

Verificar: `https://TU-BACKEND.onrender.com/api/health` → `{"status":"ok",...}` y `https://TU-BACKEND.onrender.com/api/auth/ok` → `{"ok":true}`.

### 2) Frontend → Static Site

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

En _Redirects/Rewrites_, **en este orden**:

| Source | Destination | Action |
| --- | --- | --- |
| `/api/*` | `https://TU-BACKEND.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

La primera regla es el equivalente al proxy de Vite: el frontend sigue llamando a `/api`. La segunda hace que **F5 en cualquier ruta** (`/admin`, `/peliculas/123`) funcione en vez de dar 404.

### 3) Cargar los usuarios de prueba en producción

Render gratis no tiene shell, así que se corre el seed **desde tu computadora** apuntando a la base de producción:

```bash
cd backend
MONGODB_URI="<la misma URI que usa Render>" BETTER_AUTH_URL="https://TU-FRONTEND.onrender.com" BETTER_AUTH_SECRET="<el mismo que usa Render>" npm run seed
```

## 🗂️ Estructura

```
backend/
  src/
    config/        conexión a Mongo
    lib/           auth (Better Auth), géneros, helpers
    middlewares/   authMiddleware, optionalAuth, requireRole, validateBody/Query (Zod)
    models/        Movie (Mongoose)
    schemas/       validación Zod
    services/      lógica de negocio (la usan la API y el agente)
    controllers/   capa HTTP
    routes/        mapeo método + ruta → controller
    agent/         agente LangChain (llm, prompt, tools)
  scripts/seed.ts  usuarios de prueba + películas de ejemplo
frontend/
  src/
    router/        rutas (públicas, privadas y por rol)
    pages/         Home, MovieDetail, Login, Register, MyMovies, Admin, AdminUsers, Chat
    components/    MovieForm (RHF + Zod), MoviesManager, MovieCard, Pagination...
    store/         RTK Query (cache de la API)
    lib/           auth-client (useSession), axios, SSE
```

## ✅ Checklist de la consigna

- [x] Repo con `backend/` + `frontend/`, README y `.env.example` sin secretos
- [x] Entidad propia con 4+ campos y 4 tipos (texto, número, fecha, booleano)
- [x] CRUD REST completo en `/api/movies` con Zod y códigos 201/400/401/403/404
- [x] Better Auth con email/contraseña y GitHub (+ Google), usuarios y sesiones en Mongo
- [x] Roles `user` (por defecto) y `admin`, con `authMiddleware` + `requireRole`
- [x] Frontend: listado, detalle, login/registro/logout, panel admin protegido por rol, RHF + Zod, sesión con `useSession()`
- [x] Deploy en Render con rewrite `/api/*` y `/*`
- [x] Opcionales: paginación, filtros y búsqueda · cada usuario edita solo sus registros · login con Google · página de admin para cambiar roles (`authClient.admin.setRole`) · agente LangChain
