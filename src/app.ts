import inquier from 'inquirer';
import path from 'path';
import { BibliotecaService } from './services/BibliotecaService';
import { Libro } from './models/Libro';
import inquirer from 'inquirer';
const service = new BibliotecaService(path.join(process.cwd(), 'data', 'biblioteca.json'));

async function mainMenu() {
    while (true) {
        const { opt } = await inquirer.prompt({
            type: 'list',
            name: 'opt',
            message: '=== SISTEMA DE GESTIÓN DE BIBLIOTECA ===',
            choices: [
                { name: '1. Agregar nuevo libro', value: '1' },
                { name: '2. Listar todos los libros', value: '2' },
                { name: '3. Buscar libro por ID', value: '3' },
                { name: '4. Buscar libro por título', value: '4' },
                { name: '5. Buscar libro por autor', value: '5' },
                { name: '6. Actualizar información de libro', value: '6' },
                { name: '7. Prestar libro', value: '7' },
                { name: '8. Devolver libro', value: '8' },
                { name: '9. Poner libro en mantenimiento', value: '9' },
                { name: '10. Eliminar libro', value: '10' },
                { name: '11. Mostrar estadísticas', value: '11' },
                { name: '12. Cargar datos de ejemplo', value: '12' },
                { name: '0. Salir', value: '0' }
            ]
        });
        switch (opt) {
            case '1':
                await agregarLibroPrompt();
                break;
            case '2':
                await listarLibros();
                break;
            case '3':
                await buscarPorIdPrompt();
                break;
            case '4':
                await buscarPorTituloPrompt();
                break;
            case '5':
                await buscarPorAutorPrompt();
                break;
            case '6':
                await actualizarLibroPrompt();
                break;
            case '7':
                await prestarLibroPrompt();
                break;
            case '8':
                await devolverLibroPrompt();
                break;
            case '9':
                await mantenimientoPrompt();
                break;
            case '10':
                await eliminarPrompt();
                break;
            case '11':
                await mostrarEstadisticas();
                break;
            case '12':
                await cargarEjemplo();
                break;
            case '0':
                console.log('Saliendo...');
                process.exit(0);
        }
    }
}

async function agregarLibroPrompt() {
    const resp = await inquier.prompt([
        { name: 'titulo', message: 'Título:', type: 'input' },
        { name: 'autor', message: 'Autor:', type: 'input' },
        { name: 'isbn', message: 'ISBN:', type: 'input' },
        { name: 'genero', message: 'Género:', type: 'input' },
        {
            name: 'anioPublicacion', message: 'Año de publicación (numero):',
            type: 'number'
        },
        { name: 'editorial', message: 'Editorial:', type: 'input' },
        {
            name: 'estado', message: 'Estado (disponible|prestado|mantenimiento)',
            type: 'list', choices: ['disponible', 'prestado',
                'mantenimiento']
        },
        { name: 'fechaAdquisicion', message: 'Fecha de adquisición (YYYY-MMDD):', type: 'input' },
        { name: 'ubicacion', message: 'Ubicación:', type: 'input' }
    ])

    const payload: any = { ...resp };
    if (typeof payload.anioPublicacion === 'string' &&
        payload.anioPublicacion.trim() !== '') payload.anioPublicacion =
            Number(payload.anioPublicacion);
    const result = await service.agregarLibro(payload as Omit<Libro, 'id'>);
    if (!result.ok) console.error('Errores:', result.errores);
    else console.log('Libro agregado:', result.libro);
}

async function listarLibros() {
    const todos = await service.listar();
    console.table(todos.map((l) => ({
        id: l.id, titulo: l.titulo, autor:
            l.autor, isbn: l.isbn, estado: l.estado
    })));
}

async function buscarPorIdPrompt() {
    const { id } = await inquirer.prompt({ name: 'id', message: 'ID del libro:', type: 'input' });
    const lib = await service.buscarPorId(id);
    if (!lib) console.log('Libro no encontrado');
    else console.log(lib);
}

async function buscarPorTituloPrompt() {
    const { q } = await inquirer.prompt({ name: 'q', message: 'Título (texto a buscar):', type: 'input' });
    const r = await service.buscarPorTitulo(q);
    console.table(r.map((l) => ({
        id: l.id, titulo: l.titulo, autor: l.autor,
        estado: l.estado
    })));
}
async function buscarPorAutorPrompt() {
    const { q } = await inquirer.prompt({ name: 'q', message: 'Autor (texto a buscar):', type: 'input' });
    const r = await service.buscarPorAutor(q);
    console.table(r.map((l) => ({
        id: l.id, titulo: l.titulo, autor: l.autor,
        estado: l.estado
    })));
}

async function actualizarLibroPrompt() {
    const { id } = await inquirer.prompt({
        name: 'id', message:
            'ID del libro a actualizar:', type: 'input'
    });
    const libro = await service.buscarPorId(id);
    if (!libro) return console.log('Libro no encontrado');
    const resp = await inquirer.prompt([
        {
            name: 'titulo', message: `Título [${libro.titulo}]:`, type: 'input',
            default: libro.titulo
        },
        {
            name: 'autor', message: `Autor [${libro.autor}]:`, type: 'input',
            default: libro.autor
        },
        {
            name: 'isbn', message: `ISBN [${libro.isbn}]:`, type: 'input',
            default: libro.isbn
        },
        {
            name: 'genero', message: `Género [${libro.genero || ''}]:`, type:
                'input', default: libro.genero
        },
        {
            name: 'anioPublicacion', message: `Año [${libro.anioPublicacion ||
                ''}]:`, type: 'number', default: libro.anioPublicacion
        },
        {
            name: 'editorial', message: `Editorial [${libro.editorial || ''}]:`,
            type: 'input', default: libro.editorial
        },
        {
            name: 'estado', message: `Estado [${libro.estado}]:`, type: 'list',
            choices: ['disponible', 'prestado', 'mantenimiento'], default:
                libro.estado
        },
        {
            name: 'fechaAdquisicion', message: `Fecha adquisición [$
    {libro.fechaAdquisicion || ''}]:`, type: 'input', default:
                libro.fechaAdquisicion
        },
        {
            name: 'ubicacion', message: `Ubicación [${libro.ubicacion || ''}]:`,
            type: 'input', default: libro.ubicacion
        }
    ]);
    const result = await service.actualizar(id, resp);
    if (!result.ok) console.error('Errores:', result.errores);
    else console.log('Libro actualizado:', result.libro);
}

async function prestarLibroPrompt() {
    const { id } = await inquirer.prompt({
        name: 'id', message:
            'ID del libro a prestar:', type: 'input'
    });
    const ok = await service.prestarLibro(id);
    console.log(ok ? 'Libro prestado correctamente' : 'No se pudo prestar (posible estado no válido o no existe)');
}

async function devolverLibroPrompt() {
    const { id } = await inquirer.prompt({
        name: 'id', message:
            'ID del libro a devolver:', type: 'input'
    });
    const ok = await service.devolverLibro(id);
    console.log(ok ? 'Libro devuelto correctamente' : 'No se pudo devolver (posible estado no válido o no existe)');
}
async function mantenimientoPrompt() {
    const { id } = await inquirer.prompt({
        name: 'id', message:
            'ID del libro a poner en mantenimiento:', type: 'input'
    });
    const ok = await service.ponerEnMantenimiento(id);
    console.log(ok ? 'Libro puesto en mantenimiento' : 'No se pudo (no existe)');
}
async function eliminarPrompt() {
    const { id } = await inquirer.prompt({
        name: 'id', message:
            'ID del libro a eliminar:', type: 'input'
    });
    const ok = await service.eliminar(id);
    console.log(ok ? 'Libro eliminado' : 'No se pudo eliminar (no existe)');
}


async function mostrarEstadisticas() {
    const s = await service.estadisticas();
    console.log('Estadísticas:');
    console.table(s);
}
async function cargarEjemplo() {
    const librosEjemplo: Omit<Libro, 'id'>[] = [
        {
            titulo: 'Cien años de soledad',
            autor: 'Gabriel García Márquez',
            isbn: '978-8437604947',
            genero: 'Realismo mágico',
            anioPublicacion: 1967,
            editorial: 'Sudamericana',
            estado: 'disponible',
            fechaAdquisicion: '2024-01-15',
            ubicacion: 'Estante A1'
        },
        {
            titulo: '1984',
            autor: 'George Orwell',
            isbn: '978-0451524935',
            genero: 'Ciencia ficción',
            anioPublicacion: 1949,
            editorial: 'Secker & Warburg',
            estado: 'prestado',
            fechaAdquisicion: '2024-01-20',
            ubicacion: 'Estante B2'
        }
    ];
    const creados = await service.cargarDatosEjemplo(librosEjemplo);
    console.log('Libros creados:', creados);

}
(async () => {
    console.log('Iniciando aplicación...');
    await mainMenu();
})();