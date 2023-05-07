import { movie } from '../models/movie.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from '../errors/index.js';

const messageNotFoundError = 'Карточки с этими данными не существует';
const messageBadRequestError = 'Введены некорректные данные';
const messageForbiddenError = 'Недостаточно прав для совершения действия';
const messageServerError = 'Произошла серверная ошибка';

export const getMovies = (req, res, next) => {
  movie.find({ owner: req.user._id }).then((movies) => res.send({ data: movies }))
    .catch(() => {
      next(new ServerError(messageServerError));
    });
};

export const createMovie = (req, res, next) => {
  movie
    .create({ ...req.body, owner: req.user._id })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(messageBadRequestError));
      } else {
        next(new ServerError(messageServerError));
      }
    });
};

export const deleteMovie = (req, res, next) => {
  movie
    .findById(req.params.movieId)
    .then((data) => {
      if (!data) {
        throw (new NotFoundError(messageNotFoundError));
      } else if (data.owner._id.toString() !== req.user._id) {
        throw (new ForbiddenError(messageForbiddenError));
      } else {
        return data.remove({})
          .then((newData) => res.send({ newData }));
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
