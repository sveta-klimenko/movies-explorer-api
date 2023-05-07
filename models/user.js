import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { UnauthorizedError } from '../errors/index.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: 'Почта указана неверно',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Введён неправильный эмейл или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Введён неправильный эмейл или пароль');
          }
          return user;
        });
    });
};

export const user = mongoose.model('user', userSchema);
