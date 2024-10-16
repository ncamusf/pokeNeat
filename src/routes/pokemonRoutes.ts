import { Router } from 'express';
import { getAvailablePokemons } from '../controllers/pokemonController';

const router = Router();

router.get('/', getAvailablePokemons);

export default router;