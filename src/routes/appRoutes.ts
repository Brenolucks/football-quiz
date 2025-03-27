import { Router } from 'express';
import { getClubs } from '../controllers/clubController';
import { checkPlayers, syncPlayers } from '../controllers/playerController';

const router = Router();

router.get('/player/check', checkPlayers);
router.get('/player/sync',  syncPlayers);
router.get('/clubs', getClubs);

export default router;