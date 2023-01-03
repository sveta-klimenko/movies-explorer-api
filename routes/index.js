import { Router } from 'express';
import { user } from './users.js';
import { createUser, loginUser } from '../controllers/users.js';
import { movie } from './movies.js';
import {
  signUpValidate,
  signInValidate,
} from '../utils/validatorUser.js';
import { auth } from '../middlewares/auth.js';
import { NotFoundError } from '../errors/index.js';

export const router = Router();

router.use('/crash-test', () => {
  setTimeout(() => {
    throw new Error('');
  }, 0);
});

router.post('/signin', signInValidate, loginUser);
router.post('/signup', signUpValidate, createUser);

router.use(auth);
router.use('/', user);
router.use('/', movie);

router.all('/*', (req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});
