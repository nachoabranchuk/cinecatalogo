import { useEffect, useState } from "react";

// Devuelve `value` recien despues de `delay` ms sin cambios: evita pedir a la API en cada tecla.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
