import { signIn } from "../lib/auth-client";
import { btnGhost } from "../lib/ui";

// OAuth: redirige al proveedor; al volver, Better Auth crea la sesion y manda al callbackURL.
// Si falla, vuelve a /login?error=<codigo> en vez de la pagina de error generica de Better Auth.
export const SocialButtons = ({ callbackURL }: { callbackURL: string }) => {
  const go = (provider: "github" | "google") => signIn.social({ provider, callbackURL, errorCallbackURL: "/login" });

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => go("github")} className={`${btnGhost} w-full py-2`}>
        Continuar con GitHub
      </button>
      <button type="button" onClick={() => go("google")} className={`${btnGhost} w-full py-2`}>
        Continuar con Google
      </button>
    </div>
  );
};
