import { Router } from 'express';
import {
  getMyUser,
  updateMyUser,
} from '../controllers/users.js';
import {
  profileValidate,
} from '../utils/validatorUser.js';

export const user = Router();

user.get('/users/me', getMyUser);
user.patch('/users/me', profileValidate, updateMyUser);
