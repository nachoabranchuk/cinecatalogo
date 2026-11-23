// Panel de admin: gestion de usuarios. Usa el plugin admin de Better Auth (authClient.admin.*):
// listUsers, setRole, createUser y removeUser. Todas las valida el SERVIDOR: si no sos admin, responden 403.
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminTabs } from "../components/AdminTabs";
import { authClient, useSession } from "../lib/auth-client";
import { btnDanger, btnPrimary, card, inputClass } from "../lib/ui";
import { adminCreateUserSchema, type AdminCreateUserValues } from "../schemas/auth.schema";
import type { UserRole } from "../types/auth";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
}

export const AdminUsers = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: listError } = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (listError) setError(listError.message ?? "No se pudo cargar la lista de usuarios");
    else {
      setUsers(data.users as AdminUser[]);
      setTotal(data.total);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSetRole = async (user: AdminUser, role: UserRole) => {
    setBusyId(user.id);
    const { error: roleError } = await authClient.admin.setRole({ userId: user.id, role });
    setBusyId(null);
    if (roleError) setError(roleError.message ?? "No se pudo cambiar el rol");
    else await load();
  };

  const handleRemove = async (user: AdminUser) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.email}? No se puede deshacer.`)) return;
    setBusyId(user.id);
    const { error: removeError } = await authClient.admin.removeUser({ userId: user.id });
    setBusyId(null);
    if (removeError) setError(removeError.message ?? "No se pudo eliminar el usuario");
    else await load();
  };

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserValues>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });

  const onCreate = async (values: AdminCreateUserValues) => {
    const { error: createError } = await authClient.admin.createUser(values);
    if (createError) {
      setFormError("root.server", { message: createError.message ?? "No se pudo crear el usuario" });
      return;
    }
    reset();
    await load();
  };

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Panel de administracion</h1>
      <AdminTabs />

      <form onSubmit={handleSubmit(onCreate)} noValidate className={`${card} flex flex-col gap-4 p-5`}>
        <h2 className="text-lg font-semibold">Crear usuario</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Nombre
            <input type="text" aria-invalid={!!errors.name} {...register("name")} className={inputClass} />
            {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Email
            <input type="email" aria-invalid={!!errors.email} {...register("email")} className={inputClass} />
            {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Contraseña
            <input type="password" aria-invalid={!!errors.password} {...register("password")} className={inputClass} />
            {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-300">
            Rol
            <select {...register("role")} className={inputClass}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        {errors.root?.server && (
          <p role="alert" className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">
            {errors.root.server.message}
          </p>
        )}
        <div>
          <button type="submit" disabled={isSubmitting} className={btnPrimary}>
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Usuarios ({total})</h2>
        {loading ? (
          <p className="text-zinc-500">Cargando usuarios...</p>
        ) : (
          <ul className={`${card} divide-y divide-zinc-800`}>
            {users.map((user) => {
              const isSelf = user.id === session?.user.id;
              const role = (user.role ?? "user") as UserRole;
              return (
                <li key={user.id} className="flex flex-wrap items-center gap-4 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {user.name}
                      {isSelf && <span className="ml-2 text-xs text-zinc-500">(vos)</span>}
                    </p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                  {/* No se puede quitar el rol admin a uno mismo: evita quedarse sin acceso por error. */}
                  <select
                    value={role}
                    disabled={isSelf || busyId === user.id}
                    onChange={(e) => handleSetRole(user, e.target.value as UserRole)}
                    aria-label={`Rol de ${user.email}`}
                    className={`${inputClass} w-28`}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    type="button"
                    disabled={isSelf || busyId === user.id}
                    onClick={() => handleRemove(user)}
                    className={btnDanger}
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
