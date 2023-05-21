import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { errors } from 'celebrate';
import { constants } from 'http2';
import { limiter } from './middlewares/limiter.js';
import { router } from './routes/index.js';
import { CORS } from './middlewares/CORS.js';
import { requestLogger, errorLogger } from './middlewares/logger.js';

// Слушаем 3002 порт
const { PORT = 3002 } = process.env;

const config = dotenv.config({
  path: path
    .resolve(process.env.NODE_ENV === 'production' ? '.env' : '.env.common'),
})
  .parsed;

const app = express();
app.set('config', config);

const { DB } = process.env;

mongoose.connect(DB);

app.use(requestLogger);

app.use(limiter);

app.use(helmet());

app.use(CORS);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  res.status(err.statusCode || constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    .send({ message: err.statusCode === 500 ? 'Неизвестная ошибка' : err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
