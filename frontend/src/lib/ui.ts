// Clases de Tailwind compartidas: asi los botones e inputs se ven igual en toda la app.
export const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 aria-invalid:border-red-500";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50";

export const card = "rounded-2xl border border-zinc-800 bg-zinc-900/60";

// Fecha guardada como medianoche UTC: se muestra en UTC para que no corra un dia hacia atras en Argentina.
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" });
