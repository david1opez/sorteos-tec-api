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
app.post('/setUsuario', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellidoPaterno, apellidoMaterno, pais, estado, correo_electronico, dias_conectados, ultima_conexion } = req.body;
    const db = yield promise_1.default.createConnection({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const ewalletID = Math.floor(Math.random() * 8) + 1;
    const data = yield db.execute(`INSERT INTO usuario (isAdmin, nombre, apellidoPaterno, apellidoMaterno, pais, estado, correo_electronico, dias_conectados, ultima_conexion, ewalletID) VALUES (FALSE, '${nombre}', '${apellidoPaterno}', '${apellidoMaterno}', '${pais}', '${estado}', '${correo_electronico}', ${dias_conectados}, '${ultima_conexion}', ${ewalletID})`);
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
    const data = yield db.execute(`SELECT cantidad FROM inventario WHERE (usuarioid = ${user_id} AND objetoId = 1)`);
    const cantidad = data[0][0].cantidad;
    if (cantidad > 0) {
        yield db.execute(`UPDATE inventario SET cantidad = ${cantidad - 1} WHERE (usuarioid = ${user_id} AND objetoId = 1)`);
    }
    res.status(200).send({ success: cantidad > 0 });
}));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
