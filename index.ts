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

            case 'update': {
                const [_, idStr, titulo, autor, precioStr, stockStr] = args;

                if (!idStr || !titulo || !autor || !precioStr || !stockStr) {
                    console.log('Error: Faltan argumentos. Uso: npx tsx index.ts update <ID> <titulo> <autor> <precio> <stock>');
                    break;
                }

                const id = new ObjectId(idStr);

                const actualizacion = {
                    $set: {
                        titulo,
                        autor,
                        precio: Number(precioStr),
                        stock: Number(stockStr)
                    }
                };

                const resultado = await coleccion.findOneAndUpdate(
                    { _id: id },
                    actualizacion,
                    { returnDocument: 'after' }
                );

                if (resultado) {
                    console.log('Libro actualizado exitosamente:');
                    console.log(resultado);
                } else {
                    console.log('No se encontró ningún libro con ese ID.');
                }
                break;
            }

            case 'delete': {
                const [_, idStr] = args;

                if (!idStr) {
                    console.log('Error: Falta el ID. Uso: npx tsx index.ts delete <ID>');
                    break;
                }

                const id = new ObjectId(idStr);

                const resultado = await coleccion.deleteOne({ _id: id });

                if (resultado.deletedCount === 1) {
                    console.log(`El libro con ID ${idStr} fue eliminado exitosamente.`);
                } else {
                    console.log('No se encontró ningún libro con ese ID para eliminar.');
                }
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
