import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import {
  getStudyDetail,
  createStudy,
  getAllStudy,
  getStudyFocus,
  patchStudyPoint,
  postPwCheck,
  createEmoji,
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
} from './controllers/index.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_LOCAL }));
app.use(express.json());

app.get('/studies/:studyId', getStudyDetail);

app.get('/studies', getAllStudy);
app.post('/studies/:studyId/confirm-pw', postPwCheck);
app.post('/studies', createStudy);
app.delete('/studies/:studyId', deleteStudy);
app.post('/studies/:studyId/emoji', createEmoji);
app.post('/studies/:studyId/habits', createHabit);
app.get('/studies/:studyId/habits', getHabits);
app.patch('/studies/:studyId/habits/:habitId', updateHabit);
app.delete('/studies/:studyId/habits/:habitId', deleteHabit);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
