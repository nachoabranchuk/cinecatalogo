import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { SocialButtons } from "../components/SocialButtons";
import { signIn, useSession } from "../lib/auth-client";
import { btnPrimary, card, inputClass } from "../lib/ui";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Si vino redirigido de una ruta privada, vuelve ahi despues de loguearse.
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const oauthError = new URLSearchParams(location.search).get("error");

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    // Better Auth no tira excepcion: devuelve { data, error }. Si sale bien setea la cookie y useSession se entera.
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", { message: error.message ?? "No se pudo iniciar sesion" });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className={`${card} w-full max-w-sm p-6`}>
        <Link to="/" className="text-sm text-zinc-400 hover:text-amber-300">
          ← Volver al catalogo
        </Link>
        <h1 className="mb-4 mt-3 text-2xl font-bold">Iniciar sesion</h1>

        {oauthError && (
          <p role="alert" className="mb-4 rounded-lg bg-amber-950/60 p-3 text-sm text-amber-200">
            No se pudo iniciar sesion con el proveedor externo. Proba de nuevo o ingresa con tu email.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Email
            <input type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} className={inputClass} />
            {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
              className={inputClass}
            />
            {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
          </label>
          {errors.root?.server && (
            <p role="alert" className="text-sm text-red-400">
              {errors.root.server.message}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className={`${btnPrimary} mt-1`}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-zinc-800" />o<span className="h-px flex-1 bg-zinc-800" />
        </div>

        <SocialButtons callbackURL={from} />

        <p className="mt-5 text-center text-sm text-zinc-400">
          ¿No tenes cuenta?{" "}
          <Link to="/register" className="font-medium text-amber-300 underline">
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  );
};
