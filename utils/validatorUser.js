import { Joi, celebrator, Segments } from 'celebrate';

export const linkRegExp = /^https?:\/\/(www.)?[\w-]+\.[\w-]+[\w\-._~:/?#[\]@!$&'()*+,;=]*#?$/;

const celebrate = celebrator(
  { mode: 'full' }, // проверять весь запрос (если валидируем несколько частей)
  { abortEarly: false }, // не останавливать проверку при первой же ошибке
);

const schemaSignUp = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

const schemaSignIn = Joi.object().keys({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

export const schemaObjectProfile = Joi.object({
  name: Joi.string().min(2).max(30),
  email: Joi.string().email({ tlds: { allow: false } }),

}).required();

export const profileValidate = celebrate({ [Segments.BODY]: schemaObjectProfile });
export const signUpValidate = celebrate({ [Segments.BODY]: schemaSignUp });
export const signInValidate = celebrate({ [Segments.BODY]: schemaSignIn });
