# Pasos finales (lo que tenés que hacer vos)

El código ya está armado y probado hasta donde se puede sin tus credenciales. Faltan los pasos que dependen de **tus cuentas** (GitHub, MongoDB Atlas, Google, Render). Seguilos en este orden.

## 0. Antes de subir: poné tu nombre en los commits

Los commits están hechos con un autor genérico ("Estudiante"). Configurá tu identidad y reescribí el autor de todo el historial (queda igual de chico y descriptivo, solo cambia el autor):

```bash
git config user.name  "Tu Nombre"
git config user.email "tu-email-de-github@ejemplo.com"
git rebase -r --root --exec "git commit --amend --no-edit --reset-author"
git log --format="%an <%ae> %s" | head -3   # verificar
```

## 1. Crear el repo en GitHub y subir

1. En GitHub: **New repository** (ej: `cinecatalogo`), sin README ni .gitignore (ya los tenemos).
2. Desde la carpeta del proyecto:

```bash
git remote add origin https://github.com/TU-USUARIO/cinecatalogo.git
git push -u origin main
```

3. **Chequeo de secretos** (tiene que no imprimir nada):

```bash
git log -p --all | grep -nE 'mongodb\+srv://[^ :]+:[^ @]{6,}@|GOCSPX-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' || echo "limpio"
git ls-files | grep -E "(^|/)\.env$" || echo "ningun .env commiteado"
```

> Si alguna vez commiteás un secreto por error, **no alcanza con borrarlo en otro commit**: queda en el historial. Rotá el secreto (generá uno nuevo) y reescribí el historial.

## 2. MongoDB Atlas

1. Crear un cluster gratis (M0) y un usuario de base de datos.
2. **Network Access → Add IP Address → `0.0.0.0/0`** (Render no tiene IP fija).
3. Copiar la URI y **agregarle el nombre de la base**: `mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/peliculas`.

## 3. Correrlo en local primero

```bash
cd backend && cp .env.example .env     # completar MONGODB_URI, BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:5173
npm install && npm run seed && npm run dev
# otra terminal
cd frontend && npm install && npm run dev
```

Entrá a http://localhost:5173 e iniciá sesión con `admin@peliculas.test` / `Admin1234!`. Probá: crear una película, `/admin`, `/admin/usuarios`. Con `user@peliculas.test` / `User1234!` verificá que `/admin` muestra "Sin permisos" y que solo puede editar sus propias películas.

## 4. OAuth Apps (login con GitHub y Google)

Seguí la tabla de la sección "Configurar el login social" del README.

- **GitHub:** hacen falta **dos** OAuth Apps (local y producción). La de producción se completa después del paso 5, cuando ya sepas la URL del frontend.
- **Google:** Google Cloud Console → crear proyecto → _Google Auth Platform_ (pantalla de consentimiento, tipo "Externo") → _Clientes_ → crear cliente "Aplicación web" con las dos redirect URIs. Después **pasar la app a "En producción"** para que cualquier persona pueda entrar (si queda en "Prueba", solo entran las cuentas que agregues a mano).

## 5. Deploy en Render

Seguí la sección "Deploy en Render" del README. Orden recomendado, porque cada servicio necesita la URL del otro:

1. Crear el **Web Service del backend** (con `BETTER_AUTH_URL` provisoria). Anotar su URL.
2. Crear el **Static Site del frontend** con los dos rewrites (el de `/api/*` usa la URL del backend). Anotar su URL.
3. Volver al backend y poner `BETTER_AUTH_URL` = URL del **frontend** → redeploy.
4. Crear/actualizar la **OAuth App de GitHub de producción** y la credencial de **Google** con la URL del frontend.
5. Correr el **seed contra producción** desde tu compu (comando en el README).

## 6. Completar el README

Reemplazá `TU-FRONTEND` y `TU-BACKEND` por las URLs reales (buscá `TU-` en el README) y hacé un commit: `docs: agregar URLs de produccion`.

## 7. Prueba final en producción (lo que va a mirar quien corrige)

- [ ] El frontend carga y muestra el catálogo
- [ ] **F5** en `/admin` y en `/peliculas/<id>` no da 404
- [ ] Login con email (admin y user de prueba)
- [ ] **Login con GitHub** funciona
- [ ] **Login con Google** funciona (probalo con una cuenta que NO sea la tuya, para confirmar que la app está "En producción")
- [ ] Al recargar la página la sesión se mantiene
- [ ] `user` entra a `/admin` → "Sin permisos"; `admin` sí
- [ ] `user` crea una película y solo puede editar/eliminar las suyas; el admin todas
- [ ] El admin cambia un rol en `/admin/usuarios`
- [ ] El asistente (`/asistente`) responde
- [ ] En el Network del navegador las llamadas van a `/api/...` (no a la URL del backend)

## Entrega

1. Link al repositorio
2. URL del frontend desplegado
3. README (ya está en el repo)
4. Usuarios de prueba (ya están en el README):

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | admin@peliculas.test | Admin1234! |
| user | user@peliculas.test | User1234! |
