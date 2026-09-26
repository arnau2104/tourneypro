import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });

// El SSL es opcional: solo se activa si se define DB_SSL_CA (contenido del
// certificado, tal cual, por ejemplo el que exige Aiven). Hostinger u otros
// proveedores que no exigen SSL simplemente no definen esta variable.
const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
}

export const connection = mysql.createPool(config);