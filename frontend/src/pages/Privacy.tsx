// Politica de privacidad: Google la exige para publicar la app con login social.
export const Privacy = () => (
  <article className="mx-auto flex max-w-2xl flex-col gap-4 text-zinc-300">
    <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Politica de privacidad</h1>
    <p className="text-sm text-zinc-500">CineCatalogo es un proyecto academico. Ultima actualizacion: noviembre de 2026.</p>

    <h2 className="mt-4 text-xl font-semibold text-zinc-100">Que datos recolectamos</h2>
    <p>
      Al registrarte con email y contraseña, o al ingresar con GitHub o Google, guardamos tu nombre, tu email y, si
      corresponde, tu foto de perfil publica. Si usas email y contraseña, la contraseña se guarda cifrada (hash): no
      podemos verla.
    </p>

    <h2 className="mt-4 text-xl font-semibold text-zinc-100">Para que los usamos</h2>
    <p>
      Solo para identificarte, mantener tu sesion iniciada y asociar a tu nombre las peliculas que cargas en el
      catalogo. No enviamos publicidad ni compartimos tus datos con terceros.
    </p>

    <h2 className="mt-4 text-xl font-semibold text-zinc-100">Donde se guardan</h2>
    <p>Los datos se almacenan en una base de datos MongoDB Atlas. Las sesiones usan una cookie propia del sitio.</p>

    <h2 className="mt-4 text-xl font-semibold text-zinc-100">Asistente</h2>
    <p>
      Los mensajes que escribis en el asistente se envian a un servicio de modelos de lenguaje (Groq) para generar la
      respuesta. No escribas datos personales en el chat.
    </p>

    <h2 className="mt-4 text-xl font-semibold text-zinc-100">Eliminar tu cuenta</h2>
    <p>Podes pedir que eliminemos tu cuenta y tus datos escribiendo a ignaciovalentin55@gmail.com.</p>
  </article>
);
