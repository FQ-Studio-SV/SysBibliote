import { promises as fs } from 'fs';
import path from 'path';
export class JSONManager<T extends { id: string }> {
    protected filePath: string;
    protected data: { metadata: any; libros?: T[]; items?: T[] } = {
        metadata:
            {}, items: []
    };
    constructor(filePath: string) {
        this.filePath = filePath;
    }
    async cargarDatos(): Promise<void> {
        try {
            const text = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(text);
            if (!this.data.items && this.data.libros) this.data.items =
                this.data.libros as any;
            if (!this.data.metadata) this.data.metadata = {
                version: '1.0',
                totalLibros: (this.data.items || []).length, ultimaActualizacion: new
                    Date().toISOString()
            };
        } catch (err) {
            // Si no existe archivo, crear estructura base
            if ((err as any).code === 'ENOENT') {
                this.data = {
                    metadata: {
                        version: '1.0', totalLibros: 0,
                        ultimaActualizacion: new Date().toISOString()
                    }, items: []
                };
                await this.guardarDatos();
            } else {
                throw new Error('Error al cargar datos JSON: ' + (err as
                    any).message);
            }
        }
    }
    async guardarDatos(): Promise<void> {
        // mantener compatibilidad con estructura esperada (libros)
        const out: any = { metadata: this.data.metadata };
        out.libros = this.data.items || [];
        out.metadata.totalLibros = (out.libros || []).length;
        out.metadata.ultimaActualizacion = new Date().toISOString();
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(out, null, 2), 'utf-8');
        this.data = out;
        
    }
    generarId(): string {
        // id simple y única basada en timestamp+aleatorio
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }
    async crear(item: Omit<T, 'id'>): Promise<T> {
        await this.cargarDatos();
        const newItem = { ...(item as any), id: this.generarId() } as T;
        (this.data.items as T[]).push(newItem);
        await this.guardarDatos();
        return newItem;
    }
    async crearMultiple(items: Omit<T, 'id'>[]): Promise<T[]> {
        await this.cargarDatos();
        const created: T[] = [];
        for (const it of items) {
            const newItem = { ...(it as any), id: this.generarId() } as T;
            (this.data.items as T[]).push(newItem);
            created.push(newItem);
        }
        await this.guardarDatos();
        return created;
    }
    async obtenerTodos(): Promise<T[]> {
        await this.cargarDatos();
        return (this.data.items || []) as T[];
    }
    async obtenerPorId(id: string): Promise<T | null> {
        const all = await this.obtenerTodos();
        return all.find((a) => a.id === id) ?? null;
    }
    async buscarPorFiltro(filtro: (item: T) => boolean): Promise<T[]> {
        const all = await this.obtenerTodos();
        return all.filter(filtro);
    }
    async actualizar(id: string, actualizaciones: Partial<T>): Promise<T |
        null> {
        await this.cargarDatos();
        const items = this.data.items as T[];
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...actualizaciones } as T;
        await this.guardarDatos();
        return items[idx];
        4
    }
    async eliminar(id: string): Promise<boolean> {
        await this.cargarDatos();
        const items = this.data.items as T[];
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) return false;
        items.splice(idx, 1);
        await this.guardarDatos();
        return true;
    }
}