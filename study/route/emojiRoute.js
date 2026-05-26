import express from 'express';
import { createEmoji } from '../controller/emojiController.js';

const router = express.Router();

router.post('/:studyId/emoji', createEmoji);

export default router;
