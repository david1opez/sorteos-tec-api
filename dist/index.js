"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const stripe_1 = require("stripe");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get('/getUsuarios', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const data = yield db.execute(`SELECT * FROM usuario`);
    res.send(data[0]);
}));
app.post('/crearUsuario', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, nombre, apellidoPaterno, apellidoMaterno, pais, estado, correo_electronico, telefono, } = req.body;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const paises = {
        "México": 1,
    };
    const estados = {
        "Coahuila": 5,
        "Nuevo León": 19
    };
    const ultimaConexion = new Date().toISOString().slice(0, 10);
    const ewalletID = Math.floor(Math.random() * (1050 - 1001 + 1)) + 1001;
    const userid = Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000;
    const params = "usuarioID, isAdmin, nombre, apellidoPaterno, apellidoMaterno, diasConectado, ultimaConexion, correoElectronico, UID, paisID, estadoID, walletID";
    const values = `${userid}, FALSE, "${nombre}", "${apellidoPaterno}", "${apellidoMaterno}", 0, "${ultimaConexion}", "${correo_electronico}", "${uid}", ${paises[pais]}, ${estados[estado]}, ${ewalletID}`;
    const data = yield db.execute(`INSERT INTO usuario (${params}) VALUES (${values})`);
    res.send(data[0]);
}));
app.post('/useCanica', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.body;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const data = yield db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = 1)`);
    const cantidad = data[0][0].cantidad;
    if (cantidad > 0) {
        yield db.execute(`UPDATE inventario SET cantidad = ${cantidad - 1} WHERE (usuarioID = ${user_id} AND objetoID = 1)`);
    }
    res.status(200).send({ success: cantidad > 0 });
}));
app.post('/addObject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, object_id, cantidad } = req.body;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const params = "usuarioID, objetoID, cantidad";
    const values = `"${user_id}", "${object_id}", ${cantidad}`;
    const data = yield db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = ${object_id})`);
    const q = data[0][0].cantidad;
    yield db.execute(`INSERT INTO inventario (${params}) VALUES (${values}) ON DUPLICATE KEY UPDATE cantidad = ${q + cantidad};`);
    res.status(200).send({ success: true });
}));
app.post('/getObjectQuantity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, object_id } = req.body;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const data = yield db.execute(`SELECT cantidad FROM inventario WHERE (usuarioID = ${user_id} AND objetoID = ${object_id})`);
    const cantidad = data[0][0].cantidad;
    res.status(200).send({ cantidad });
}));
app.get('/getUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.query;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const data = yield db.execute(`SELECT * FROM usuario WHERE UID = "${uid}"`);
    res.send(data[0]);
}));
const stripe = new stripe_1.Stripe(process.env.STRIPE_SK || '');
app.get('/createStripeClient', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.query;
    const { id } = yield stripe.customers.create({
        name: typeof name === 'string' ? name : '',
        email: typeof email === 'string' ? email : '',
    });
    res.send({ id });
}));
app.get('/getClientSecret', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, id } = req.query;
    const customer = yield stripe.customers.retrieve(typeof id === 'string' ? id : '');
    const paymentIntent = yield stripe.paymentIntents.create({
        amount: typeof amount === 'string' ? parseInt(amount) * 100 : 0,
        currency: 'mxn',
        customer: typeof customer.id === 'string' ? customer.id : '',
        setup_future_usage: 'off_session',
    });
    res.send({ client_secret: paymentIntent.client_secret });
}));
app.get('/getCards', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const cards = yield stripe.customers.listSources(typeof id === 'string' ? id : '', { object: 'card' });
    res.send(cards.data);
}));
const PORT = 3000;
app.listen(PORT, () => {
    console.log();
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
