import { Router } from 'express';
import { submitAdoptionRequest, getAdoptionStatus } from '../controllers/adoptionController';

const router = Router();

router.post('/', submitAdoptionRequest);
router.get('/:id/status', getAdoptionStatus);

export default router;