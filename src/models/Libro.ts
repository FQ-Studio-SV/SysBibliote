export type EstadoLibro = 'disponible' | 'prestado' | 'mantenimiento';
export interface Libro {
    id: string;
    titulo: string;
    autor: string;
    isbn: string;
    genero?: string;
    anioPublicacion?: number;
    editorial?: string;
    estado: EstadoLibro;
    fechaAdquisicion?: string; // ISO date

    ubicacion?: string;
}