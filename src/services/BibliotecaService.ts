import path from 'path';
import { LibroRepository } from '../repositories/LibroRepository';
import { Libro } from '../models/Libro';
import { validarLibroDatos } from '../utils/helpers';
const DEFAULT_DB = path.join(process.cwd(), 'data', 'biblioteca.json');
export class BibliotecaService {
    private repo: LibroRepository;
    constructor(dbPath = DEFAULT_DB) {
        this.repo = new LibroRepository(dbPath);
    }
    async agregarLibro(datos: Omit<Libro, 'id'>): Promise<{
        ok: boolean;
        libro?: Libro; errores?: string[]
    }> {
        const { ok, errores } = validarLibroDatos(datos);

        if (!ok) return { ok: false, errores };
        // unicidad ISBN
        const existentes = await this.repo.buscarPorFiltro((l) => l.isbn ===
            datos.isbn);
        if (existentes.length > 0) return {
            ok: false, errores: ['ISBN ya existe']
        };
        const nuevo = await this.repo.crear(datos as any);
        return { ok: true, libro: nuevo };
    }
    async listar(): Promise<Libro[]> {
        return this.repo.obtenerTodos();
    }
    async buscarPorId(id: string): Promise<Libro | null> {
        return this.repo.obtenerPorId(id);
    }
    async buscarPorTitulo(t: string) {
        return this.repo.buscarPorTitulo(t);
    }
    async buscarPorAutor(a: string) {
        return this.repo.buscarPorAutor(a);
    }
    async actualizar(id: string, actualizaciones: Partial<Libro>) {
        // evitar actualizar id
        delete (actualizaciones as any).id;
        const valid = validarLibroDatos({
            ...(await this.repo.obtenerPorId(id)
                || {}), ...actualizaciones
        });
        if (!valid.ok) return { ok: false, errores: valid.errores };
        const updated = await this.repo.actualizar(id, actualizaciones as
            Partial<Libro>);
        if (!updated) return { ok: false, errores: ['Libro no encontrado'] };
        return { ok: true, libro: updated };
    }
    async prestarLibro(id: string) {
        return this.repo.prestarLibro(id);
    }
    async devolverLibro(id: string) {
        return this.repo.devolverLibro(id);
    }
    async ponerEnMantenimiento(id: string) {
        return this.repo.ponerEnMantenimiento(id);
    }

    async eliminar(id: string) {
        return this.repo.eliminar(id);
    }
    async estadisticas() {
        return this.repo.obtenerEstadisticas();
    }
    async cargarDatosEjemplo(libros: Omit<Libro, 'id'>[]) {
        // crear multiples respetando unicidad de isbn
        const creados: any[] = [];
        for (const l of libros) {
            const exists = await this.repo.buscarPorFiltro((x) => x.isbn ===
                l.isbn);
            if (exists.length === 0) {
                const c = await this.repo.crear(l as any);
                creados.push(c);
            }
        }
        return creados;
    }
}