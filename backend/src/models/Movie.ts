import { Schema, model, Document, Model, Types } from "mongoose";
import { GENRES, type Genre } from "../lib/genres.js";

// Entidad elegida: Pelicula. Tipos usados: texto, numero, fecha y booleano.
export interface IMovie {
  title: string; // texto
  director: string; // texto
  genre: Genre; // texto (lista cerrada)
  releaseDate: Date; // fecha
  durationMinutes: number; // numero
  rating: number; // numero (0 a 10)
  inTheaters: boolean; // booleano
  synopsis?: string;
  posterUrl?: string;
  // Dueño del registro (id del usuario de Better Auth). Lo setea el servidor, nunca el cliente.
  createdBy: string;
  createdByName: string;
}

export interface IMovieDocument extends IMovie, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovieDocument>(
  {
    title: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
      maxlength: [150, "El titulo no puede superar los 150 caracteres"],
    },
    director: {
      type: String,
      required: [true, "El director es obligatorio"],
      trim: true,
      maxlength: [100, "El director no puede superar los 100 caracteres"],
    },
    genre: {
      type: String,
      enum: { values: GENRES, message: "Genero invalido" },
      required: [true, "El genero es obligatorio"],
    },
    releaseDate: { type: Date, required: [true, "La fecha de estreno es obligatoria"] },
    durationMinutes: {
      type: Number,
      required: [true, "La duracion es obligatoria"],
      min: [1, "La duracion debe ser de al menos 1 minuto"],
      max: [600, "La duracion no puede superar los 600 minutos"],
    },
    rating: {
      type: Number,
      required: [true, "La puntuacion es obligatoria"],
      min: [0, "La puntuacion minima es 0"],
      max: [10, "La puntuacion maxima es 10"],
    },
    inTheaters: { type: Boolean, default: false },
    synopsis: { type: String, trim: true, maxlength: [1000, "La sinopsis no puede superar los 1000 caracteres"] },
    posterUrl: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: String, required: true, index: true },
    createdByName: { type: String, required: true },
  },
  { timestamps: true }
);

// Indice de texto liviano para ordenar/buscar por titulo rapido.
movieSchema.index({ title: 1 });

const Movie: Model<IMovieDocument> = model<IMovieDocument>("Movie", movieSchema);

export default Movie;
