const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./routes/index.js');
const mercadopago = require("mercadopago");
const { TOKEN_MP } = process.env;

require('./db.js');

const server = express();

mercadopago.configure({
	access_token: TOKEN_MP,
});

server.name = 'API';

server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));
server.use(cors({
  origin: [
    ' * ',
    'https://soy-puebla-deploy.vercel.app',
    'https://soypuebladeploy-production.up.railway.app',
    'http://localhost:5173',
    'https://worthy-insect-17.accounts.dev/sign-up',
    'https://worthy-insect-17.accounts.dev/sign-in'
  ]
}));

server.use(cors());

server.use('/', router);

server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;