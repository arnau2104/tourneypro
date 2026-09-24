import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// const config = {
//     host: 'localhost',  // cambia localhost por esto
//     port: 8889,          // añade el puerto de MAMP
//     user: 'root',
//     password: 'root',    // en MAMP la password por defecto es root
//     database: 'tourneypro'
// }

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(path.resolve(process.cwd(), 'backend/aiven-ca.pem'))
    }
}

export const connection = mysql.createPool(config);