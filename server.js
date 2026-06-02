import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { studyController, habitController } from './controllers/index.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_LOCAL }));
app.use(express.json());

app.get('/studies', studyController.getAllStudy);
app.post('/studies', studyController.createStudy);

app.get('/studies/:studyId', studyController.getStudyDetail);
app.patch('/studies/:studyId', studyController.updateStudy);
app.delete('/studies/:studyId', studyController.deleteStudy);

app.post('/studies/:studyId/confirm-pw', studyController.postPwCheck);
app.post('/studies/:studyId/emoji', studyController.createEmoji);

app.post('/studies/:studyId/habits', habitController.createHabit);
app.get('/studies/:studyId/habits', habitController.getHabits);

app.patch('/studies/:studyId/habits/:habitId', habitController.updateHabit);
app.delete('/studies/:studyId/habits/:habitId', habitController.deleteHabit);

app.get(`/studies/:studyId/focus`, studyController.getStudyFocus);
app.patch(`/studies/:studyId/focus`, studyController.patchStudyPoint);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
