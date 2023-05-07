import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { user } from '../models/user.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from '../errors/index.js';

const conflictErrorCode = 11000;

const { NODE_ENV, JWT_SECRET } = process.env;

const messageNotFoundError = 'Пользователя с этими данными не существует';
const messageBadRequestError = 'Введены некорректные данные';
const messageConflictError = 'Пользователь с этим email уже зарегестрирован';
const messageUnauthorizedError = 'Неверный логин или пароль';
const messageServerError = 'Произошла серверная ошибка';

export const getMyUser = (req, res, next) => {
  user
    .findById(req.user._id)
    .then((data) => {
      if (data) {
        res.send({ data });
      } else {
        throw (new NotFoundError(messageNotFoundError));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(messageBadRequestError));
      } else {
        next(err);
      }
    });
};

export const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => user.create({
      name,
      email,
      password: hash,
    }))
    .then((document) => {
      const userObject = document.toObject();
      delete userObject.password;
      res.send({ data: userObject });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(messageBadRequestError));
      } else if (err.code === conflictErrorCode) {
        next(new ConflictError(messageConflictError));
      } else {
        next(err);
      }
    });
};

export const updateMyUser = (req, res, next) => {
  const { name, email } = req.body;
  user
    .findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    )
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        throw (new NotFoundError(messageNotFoundError));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(messageBadRequestError));
      } else {
        next(new ServerError(messageServerError));
      }
    });
};

export const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  return user.findUserByCredentials(email, password)
    .then((data) => {
      const token = jwt.sign({ _id: data._id }, NODE_ENV === 'production' ? JWT_SECRET : 'token-secret-salt', {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'UnauthorizedError') {
        next(new UnauthorizedError(messageUnauthorizedError));
      } else {
        next(new ServerError(messageServerError));
      }
    });
};
