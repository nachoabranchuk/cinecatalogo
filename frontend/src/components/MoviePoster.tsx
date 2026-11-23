import { useState } from "react";

interface MoviePosterProps {
  title: string;
  posterUrl?: string;
  className?: string;
}

// Si no hay poster (o la imagen falla) se muestra un degradado con la inicial: el tono sale del titulo,
// asi cada pelicula se ve distinta pero siempre igual.
export const MoviePoster = ({ title, posterUrl, className = "" }: MoviePosterProps) => {
  const [failed, setFailed] = useState(false);

  if (posterUrl && !failed) {
    return (
      <img
        src={posterUrl}
        alt={`Poster de ${title}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  const hue = [...title].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 0);
  return (
    <div
      role="img"
      aria-label={`Sin poster: ${title}`}
      className={`flex items-center justify-center text-5xl font-bold text-white/80 ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 28%), hsl(${(hue + 50) % 360} 50% 14%))` }}
    >
      {title.trim().charAt(0).toUpperCase()}
    </div>
  );
};
