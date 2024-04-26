import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv'
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/getUsuarios', async (req, res) => {
    const db = await mysql.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT!),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });

    const data = await db.execute(`SELECT * FROM usuario`);

    res.send(data[0]);
});

app.post('/crearUsuario', async (req, res) => {
  const {
    uid,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    pais,
    estado,
    correo_electronico,
    telefono,
  } = req.body;

  const db = await mysql.createConnection({
      host: process.env.HOST,
      port: parseInt(process.env.PORT!),
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
  });

  const paises: {[key: string]: number} = {
    "México": 1,
  }

  const estados: {[key: string]: number} = {
    "Coahuila": 5,
    "Nuevo León": 19
  }

  const ultimaConexion = new Date().toISOString().slice(0, 10);
  console.log(`${ultimaConexion}`);

  const ewalletID = Math.floor(Math.random() * 8) + 1;
  
  const params = "isAdmin, nombre, apellidoPaterno, apellidoMaterno, diasConectado, ultimaConexion, correoElectronico, UID, paisID, estadoID, walletID";
  const values = `FALSE, "${nombre}", "${apellidoPaterno}", "${apellidoMaterno}", 0, "${ultimaConexion}", "${correo_electronico}", "${uid}", ${paises[pais]}, ${estados[estado]}, ${ewalletID}`
  const data = await db.execute(`INSERT INTO usuario (${params}) VALUES (${values})`)

  res.send(data[0]);
});

app.post('/useCanica', async (req, res) => {
  const { user_id } = req.body;

  const db = await mysql.createConnection({
      host: process.env.HOST,
      port: parseInt(process.env.PORT!),
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
  });
  
  const data: any = await db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = 1)`);

  console.log(data);
  
  const cantidad: any = data[0][0].cantidad;

  if (cantidad > 0) {
    await db.execute(`UPDATE inventario SET cantidad = ${cantidad-1} WHERE (usuarioID = ${user_id} AND objetoID = 1)`);
  }

  res.status(200).send({success: cantidad > 0});
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
