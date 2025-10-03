import { Libro } from "../models/Libro";

export function validarLibroDatos(payload: Partial<Libro>): {
    ok: boolean;
    errores: string[]
} {
    const errores: string[] = [];
    if (!payload.titulo || typeof payload.titulo !== 'string')
        errores.push('titulo es obligatorio y debe ser string');
    if (!payload.autor || typeof payload.autor !== 'string')
        errores.push('autor es obligatorio y debe ser string');
    if (!payload.isbn || typeof payload.isbn !== 'string') errores.push('isbn es obligatorio y debe ser string');
if (payload.anioPublicacion && typeof payload.anioPublicacion !==
        'number') errores.push('anioPublicacion debe ser número');
    if (payload.fechaAdquisicion &&
        isNaN(Date.parse(payload.fechaAdquisicion))) errores.push('fechaAdquisicion debe ser fecha ISO válida');
if (payload.estado && !['disponible', 'prestado',
        'mantenimiento'].includes(payload.estado)) errores.push('estado inválido');
    return { ok: errores.length === 0, errores };
}