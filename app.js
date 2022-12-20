import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errors } from 'celebrate';
import { constants } from 'http2';
import { user } from './routes/users.js';
import { createUser, loginUser } from './controllers/users.js';
import { movie } from './routes/movies.js';
import {
  signUpValidate,
  signInValidate,
} from './utils/validatorUser.js';
import { auth } from './middlewares/auth.js';
import { CORS } from './middlewares/CORS.js';
import { NotFoundError } from './errors/index.js';
import { requestLogger, errorLogger } from './middlewares/logger.js';

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const config = dotenv.config({
  path: path
    .resolve(process.env.NODE_ENV === 'production' ? '.env' : '.env.common'),
})
  .parsed;

const app = express();
app.set('config', config);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  max: 100, // можно совершить максимум 100 запросов с одного IP
});

// подключаем rate-limiter
app.use(limiter);

mongoose.connect('mongodb://127.0.0.1:27017/moviesdb');

app.use(requestLogger);

app.use(helmet());

app.use(CORS);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', signInValidate, loginUser);
app.post('/signup', signUpValidate, createUser);

app.use(auth);
app.use('/', user);
app.use('/', movie);

app.all('/*', (req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});

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
