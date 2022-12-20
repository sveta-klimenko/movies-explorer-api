import { Router } from 'express';

import {
  getMovies,
  createMovie,
  deleteMovie,
} from '../controllers/movies.js';
import {
  validateMovie,
  validateId,
} from '../utils/validatorMovie.js';

export const movie = Router();

movie.get('/movies', getMovies);
movie.post('/movies', validateMovie, createMovie);
movie.delete('/movies/:movieId', validateId, deleteMovie);
