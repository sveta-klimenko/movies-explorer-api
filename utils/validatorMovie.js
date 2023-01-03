import { Joi, celebrator, Segments } from 'celebrate';

export const linkRegExp = /^https?:\/\/(www.)?[\w-]+\.[\w-]+[\w\-._~:/?#[\]@!$&'()*+,;=]*#?$/;

const celebrate = celebrator(
  { mode: 'full' }, // проверять весь запрос (если валидируем несколько частей)
  { abortEarly: false }, // не останавливать проверку при первой же ошибке
);

const schemaMovie = Joi.object({
  country: Joi.string().required(),
  director: Joi.string().required(),
  duration: Joi.number().required(),
  year: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().pattern(linkRegExp).required(),
  trailerLink: Joi.string().pattern(linkRegExp).required(),
  thumbnail: Joi.string().pattern(linkRegExp).required(),
  movieId: Joi.number().required(),
  nameRU: Joi.string().required(),
  nameEN: Joi.string().required(),
}).required();

const schemaId = Joi.object({
  movieId: Joi.string().length(24).hex().required(),
}).required();

export const validateMovie = celebrate({ [Segments.BODY]: schemaMovie });
export const validateId = celebrate({ [Segments.PARAMS]: schemaId });
