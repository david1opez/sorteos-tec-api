import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv'
import cors from 'cors';
import bodyParser from 'body-parser';
import { Stripe } from 'stripe';

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

  const ewalletID = Math.floor(Math.random() * (50 - 1 + 1)) + 1;
  const userid = Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000;
  
  const params = "usuarioID, isAdmin, nombre, apellidoPaterno, apellidoMaterno, diasConectado, ultimaConexion, correoElectronico, UID, paisID, estadoID, walletID";
  const values = `${userid}, FALSE, "${nombre}", "${apellidoPaterno}", "${apellidoMaterno}", 0, "${ultimaConexion}", "${correo_electronico}", "${uid}", ${paises[pais]}, ${estados[estado]}, ${ewalletID}`
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
  
  const cantidad: any = data[0][0].cantidad;

  if (cantidad > 0) {
    await db.execute(`UPDATE inventario SET cantidad = ${cantidad-1} WHERE (usuarioID = ${user_id} AND objetoID = 1)`);
  }

  res.status(200).send({success: cantidad > 0});
});

app.post('/addObject', async (req, res) => {
  const { user_id, object_id, cantidad } = req.body;

  const db = await mysql.createConnection({
      host: process.env.HOST,
      port: parseInt(process.env.PORT!),
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
  });

  const params = "usuarioID, objetoID, cantidad";
  const values = `"${user_id}", "${object_id}", ${cantidad}`;

  const data: any = await db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = ${object_id})`);

  const q: any = data[0][0].cantidad;

  await db.execute(`INSERT INTO inventario (${params}) VALUES (${values}) ON DUPLICATE KEY UPDATE cantidad = ${q+cantidad};`);
  
  res.status(200).send({success: true});
});

app.post('/getObjectQuantity', async (req, res) => {
  const { user_id, object_id } = req.body;

  const db = await mysql.createConnection({
      host: process.env.HOST,
      port: parseInt(process.env.PORT!),
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
  });

  const data: any = await db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = ${object_id})`);

  const cantidad: any = data[0][0].cantidad;
  
  res.status(200).send({cantidad});
});

app.get('/getUser', async (req, res) => {
  const { uid } = req.query;

  const db = await mysql.createConnection({
    host: process.env.HOST,
    port: parseInt(process.env.PORT!),
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  });

  const data = await db.execute(`SELECT * FROM usuario WHERE UID = "${uid}"`);

  res.send(data[0]);
});

const stripe = new Stripe(process.env.STRIPE_SK || '');

app.get('/createStripeClient', async (req, res) => {
  const { name, email } = req.query;

  const { id } = await stripe.customers.create({
    name: typeof name === 'string' ? name : '',
    email: typeof email === 'string' ? email : '',
  });

  res.send({id});
});

app.get('/getClientSecret', async (req, res) => {
  const { amount, id } = req.query; 

  const customer = await stripe.customers.retrieve(typeof id === 'string' ? id : '');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: typeof amount === 'string' ? parseInt(amount)*100 : 0,
    currency: 'mxn',
    customer: typeof customer.id === 'string' ? customer.id : '',
    setup_future_usage: 'off_session',
  });

  res.send({client_secret: paymentIntent.client_secret});
});

app.get('/getCards', async (req, res) => {
  const { id } = req.query;

  const cards = await stripe.customers.listSources(typeof id === 'string' ? id : '', {object: 'card'});

  res.send(cards.data);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log()
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
