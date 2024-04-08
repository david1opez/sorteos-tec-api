import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());

app.get('/datos', async (req, res) => {
    const db = await mysql.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT!),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    
    const data = await db.execute('SELECT * FROM compra')

    res.send(data[0]);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
