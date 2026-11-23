import { btnGhost } from "../lib/ui";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, total, onChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return <p className="text-sm text-zinc-500">{total} resultado{total === 1 ? "" : "s"}</p>;
  }

  return (
    <nav aria-label="Paginacion" className="flex items-center justify-between gap-3">
      <p className="text-sm text-zinc-500">{total} resultados</p>
      <div className="flex items-center gap-2">
        <button type="button" className={btnGhost} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ← Anterior
        </button>
        <span className="text-sm text-zinc-400">
          Pagina {page} de {totalPages}
        </span>
        <button type="button" className={btnGhost} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Siguiente →
        </button>
      </div>
    </nav>
  );
};
