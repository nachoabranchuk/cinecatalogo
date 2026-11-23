// Cliente de Better Auth.
// Sin baseURL: el front y la API comparten origen (proxy de Vite en local, rewrite de Render en produccion).
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// adminClient() agrega authClient.admin.* (listUsers, setRole, createUser, removeUser).
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

// useSession es estado del SERVIDOR: pide /api/auth/get-session y lo cachea. Por eso al recargar (F5)
// la sesion se mantiene: la cookie viaja sola y la sesion vive en la base.
export const { useSession, signIn, signUp, signOut } = authClient;
