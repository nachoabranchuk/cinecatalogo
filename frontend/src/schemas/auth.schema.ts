import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres" }).max(80),
    email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
    password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Repetí la contraseña" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Alta de usuario desde el panel de admin (authClient.admin.createUser).
export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres" }).max(80),
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
  role: z.enum(["user", "admin"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type AdminCreateUserValues = z.infer<typeof adminCreateUserSchema>;
