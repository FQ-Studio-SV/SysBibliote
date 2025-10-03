import { JSONManager } from './JSONManager';
import { Libro, EstadoLibro } from '../models/Libro';
export class LibroRepository extends JSONManager<Libro> {
    constructor(filePath: string) {
        super(filePath);
    }
    async buscarPorTitulo(titulo: string): Promise<Libro[]> {
        const q = titulo.toLowerCase();
        return this.buscarPorFiltro((l) => l.titulo.toLowerCase().includes(q));
    }
    async buscarPorAutor(autor: string): Promise<Libro[]> {
        const q = autor.toLowerCase();
        return this.buscarPorFiltro((l) => l.autor.toLowerCase().includes(q));
    }
    async buscarPorGenero(genero: string): Promise<Libro[]> {
        const q = genero.toLowerCase();
        return this.buscarPorFiltro((l) => (l.genero ||
            '').toLowerCase().includes(q));
    }
    async buscarPorEstado(estado: EstadoLibro): Promise<Libro[]> {
        return this.buscarPorFiltro((l) => l.estado === estado);
    }
    // operaciones de negocio
    private async cambiarEstado(id: string, nuevoEstado: EstadoLibro):
        Promise<boolean> {
        const libro = await this.obtenerPorId(id);
        if (!libro) return false;
        
        // Reglas simples de transición: disponible -> prestado, prestado -> disponible(devolver), cualquiera -> mantenimiento
        if (libro.estado === nuevoEstado) return true; // sin cambios
        // Validar flujo
        if (nuevoEstado === 'prestado' && libro.estado !== 'disponible') return false;
        if (nuevoEstado === 'disponible' && libro.estado !== 'prestado') return false;
        // mantenimiento puede venir de cualquiera
        libro.estado = nuevoEstado;
        await this.actualizar(id, libro);
        return true;
    }
    async prestarLibro(id: string): Promise<boolean> {
        return this.cambiarEstado(id, 'prestado');
    }
    async devolverLibro(id: string): Promise<boolean> {
        return this.cambiarEstado(id, 'disponible');
    }
    async ponerEnMantenimiento(id: string): Promise<boolean> {
        // permita poner en mantenimiento desde cualquier estado
        const libro = await this.obtenerPorId(id);
        if (!libro) return false;
        libro.estado = 'mantenimiento';
        await this.actualizar(id, libro);
        return true;
    }
    async obtenerEstadisticas(): Promise<{
        total: number;
        disponibles: number;
        prestados: number;
        enMantenimiento: number;
        porGenero: Record<string, number>;
    }> {
        const all = await this.obtenerTodos();
        const total = all.length;
        const disponibles = all.filter((l) => l.estado === 'disponible').length;
        const prestados = all.filter((l) => l.estado === 'prestado').length;
        const enMantenimiento = all.filter((l) => l.estado ===
            'mantenimiento').length;
        const porGenero: Record<string, number> = {};
        for (const l of all) {
            const g = l.genero || 'Sin género';
            porGenero[g] = (porGenero[g] || 0) + 1;
        }
        return { total, disponibles, prestados, enMantenimiento, porGenero };
        
    }
}