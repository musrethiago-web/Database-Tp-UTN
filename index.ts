import { MongoClient, ObjectId } from 'mongodb'

interface Libro {
    _id?: ObjectId;
    titulo: string;
    autor: string;
    precio: number;
    stock: number;
}


const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);
const dbName = 'biblioteca';
const collectionName = 'libros';


async function main() {

    const args = process.argv.slice(2);
    const accion = args[0];

    try {
        await client.connect();
        const db = client.db(dbName);
        const coleccion = db.collection<Libro>(collectionName);

        switch (accion) {
            case 'create': {
                const [_, titulo, autor, precioStr, stockStr] = args;

                if (!titulo || !autor || !precioStr || !stockStr) {
                    console.log('Error: Faltan argumentos. Uso: npx tsx index.ts create <titulo> <autor> <precio> <stock>');
                    break;
                }

                const nuevoLibro: Libro = {
                    titulo,
                    autor,
                    precio: Number(precioStr),
                    stock: Number(stockStr)
                };

                const resultado = await coleccion.insertOne(nuevoLibro);
                console.log(`Libro guardado con éxito. ID: ${resultado.insertedId}`);
                break;
            }
            case 'read': {

                const libros = await coleccion.find({}).toArray();
                console.log('\n--- Lista de Libros en la Biblioteca ---');
                console.table(libros);
                break;
            }

            default:
                console.log('Comando no reconocido. Opciones válidas: create, read, update, delete.');
        }
    } catch (error) {
        console.error('Ocurrió un error en la ejecución:', error);
    } finally {
        await client.close();
    }
}

main();