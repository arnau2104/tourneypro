import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',  // cambia localhost por esto
    port: 8889,          // añade el puerto de MAMP
    user: 'root',
    password: 'root',    // en MAMP la password por defecto es root
    database: 'tourneypro'
}

export const connection = mysql.createPool(config);