// Ruta publica "/register". Crea el usuario (siempre rol "user": el rol no se puede elegir al registrarse)
// y Better Auth abre la sesion en el mismo paso.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";
import { SocialButtons } from "../components/SocialButtons";
import { signUp, useSession } from "../lib/auth-client";
import { btnPrimary, card, inputClass } from "../lib/ui";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async ({ name, email, password }: RegisterFormValues) => {
    // signUp ya deja la sesion abierta, no hace falta un login aparte.
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      setError("root.server", { message: error.message ?? "No se pudo crear la cuenta" });
      return;
    }
    navigate("/", { replace: true });
  };

  const fields = [
    { name: "name", label: "Nombre", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Contraseña (minimo 8 caracteres)", type: "password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Repetir contraseña", type: "password", autoComplete: "new-password" },
  ] as const;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className={`${card} w-full max-w-sm p-6`}>
        <Link to="/" className="text-sm text-zinc-400 hover:text-amber-300">
          ← Volver al catalogo
        </Link>
        <h1 className="mb-4 mt-3 text-2xl font-bold">Crear cuenta</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          {fields.map(({ name, label, type, autoComplete }) => (
            <label key={name} className="flex flex-col gap-1 text-sm text-zinc-300">
              {label}
              <input
                type={type}
                autoComplete={autoComplete}
                aria-invalid={!!errors[name]}
                {...register(name)}
                className={inputClass}
              />
              {errors[name] && <span className="text-xs text-red-400">{errors[name].message}</span>}
            </label>
          ))}
          {errors.root?.server && (
            <p role="alert" className="text-sm text-red-400">
              {errors.root.server.message}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className={`${btnPrimary} mt-1`}>
            {isSubmitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-zinc-800" />o<span className="h-px flex-1 bg-zinc-800" />
        </div>

        <SocialButtons callbackURL="/" />

        <p className="mt-5 text-center text-sm text-zinc-400">
          ¿Ya tenes cuenta?{" "}
          <Link to="/login" className="font-medium text-amber-300 underline">
            Ingresar
          </Link>
        </p>
      </section>
    </main>
  );
};
