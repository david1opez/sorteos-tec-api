import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.get('/datos', async (req, res) => {
    const db = await mysql.createConnection({
        host: 'mysql-409f321-tec-beb1.a.aivencloud.com',
        port: 21996,
        user: 'andy',
        password: 'AVNS_hF57l8rg5ij3KGUqJIb',
        database: 'entrega1.4_2'
    });
    
    const data = await db.execute('SELECT * FROM compra')

    res.send({ data });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
