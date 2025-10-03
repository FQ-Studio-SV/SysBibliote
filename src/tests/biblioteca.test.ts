import path from 'path';
import fs from 'fs';
import { BibliotecaService } from '../services/BibliotecaService';
const TEST_DB = path.join(__dirname, 'test-biblioteca.json');
beforeEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});
afterAll(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});
describe('BibliotecaService', () => {
    it('agrega, obtiene y elimina libro', async () => {
        const svc = new BibliotecaService(TEST_DB);
        const { ok, libro } = await svc.agregarLibro({
            titulo: 'Prueba',
            autor: 'Autor',
            isbn: 'ISBN-1',
            estado: 'disponible'
        } as any);
        expect(ok).toBe(true);
        expect(libro).toBeDefined();
        const encontrado = await svc.buscarPorId(libro!.id);
        expect(encontrado).not.toBeNull();
        const elim = await svc.eliminar(libro!.id);
        expect(elim).toBe(true);
    });
    it('no permite ISBN duplicado', async () => {
        const svc = new BibliotecaService(TEST_DB);
        const r1 = await svc.agregarLibro({
            titulo: 'A', autor: 'X', isbn:
                'DUP', estado: 'disponible'
        } as any);
        expect(r1.ok).toBe(true);
        const r2 = await svc.agregarLibro({
            titulo: 'B', autor: 'Y', isbn:
                'DUP', estado: 'disponible'
        } as any);
        expect(r2.ok).toBe(false);

    });
    it('maneja transiciones de estado', async () => {
        const svc = new BibliotecaService(TEST_DB);
        const { libro } = await svc.agregarLibro({
            titulo: 'T', autor: 'U',
            isbn: 'S1', estado: 'disponible'
        } as any);
        expect(libro).toBeDefined();
        const prestado = await svc.prestarLibro(libro!.id);
        expect(prestado).toBe(true);
        const devolver = await svc.devolverLibro(libro!.id);
        expect(devolver).toBe(true);
    });
});