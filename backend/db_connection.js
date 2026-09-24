import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });

// En Vercel el sistema de archivos del despliegue no es fiable para leer
// el certificado dinámicamente, así que se puede pasar por variable de entorno
// (contenido completo del .pem). En local/Render se sigue leyendo el archivo.
const caCert = process.env.DB_SSL_CA
    ? process.env.DB_SSL_CA
    : fs.readFileSync(path.resolve(__dirname, 'aiven-ca.pem'), 'utf8');

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: caCert
    }
}

export const connection = mysql.createPool(config);