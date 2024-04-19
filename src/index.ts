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

app.post('/setUsuario', async (req, res) => {
  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    pais,
    estado,
    correo_electronico,
    dias_conectados,
    ultima_conexion
  } = req.body;

  const db = await mysql.createConnection({
      host: process.env.HOST,
      port: parseInt(process.env.PORT!),
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
  });

  const ewalletID = Math.floor(Math.random() * 8) + 1;
  
  const data = await db.execute(`INSERT INTO usuario (isAdmin, nombre, apellidoPaterno, apellidoMaterno, pais, estado, correo_electronico, dias_conectados, ultima_conexion, ewalletID) VALUES (FALSE, '${nombre}', '${apellidoPaterno}', '${apellidoMaterno}', '${pais}', '${estado}', '${correo_electronico}', ${dias_conectados}, '${ultima_conexion}', ${ewalletID})`)

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
  
  const data: any = await db.execute(`SELECT cantidad FROM invetario WHERE (usuarioid = ${user_id} AND objetoId = canicas_id)`);
  const cantidad: any = data[0][0].cantidad;

  if (cantidad > 0) {
    await db.execute(`UPDATE inventario SET cantidad = ${cantidad-1} WHERE (usuarioid = ${user_id} AND objetoId = canicas_id)`);
  }

  res.status(200).send({success: cantidad > 0});
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
