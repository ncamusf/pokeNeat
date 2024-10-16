import { Router } from 'express';
import { submitAdoptionRequest} from '../controllers/adoptionController';

const router = Router();

router.post('/', submitAdoptionRequest);

export default router;