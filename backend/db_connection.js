import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tourneypro'
}

export const connection = mysql.createPool(config);
