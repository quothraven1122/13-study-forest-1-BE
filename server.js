import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import {
  getStudyDetail,
  createStudy,
  postPwCheck,
  createEmoji,
  createHabit,
  updateHabit,
  deleteHabit,
} from './controllers/index.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_LOCAL }));
app.use(express.json());

app.get('/studies/:studyId', getStudyDetail);
app.post('/studies/:studyId/confirm-pw', postPwCheck);
app.post('/studies', createStudy);
app.post('/studies/:studyId/emoji', createEmoji);

app.post('/studies/:studyId/habits', createHabit);
app.patch('/studies/:studyId/habits/:habitId', updateHabit);
app.delete('/studies/:studyId/habits/:habitId', deleteHabit);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
