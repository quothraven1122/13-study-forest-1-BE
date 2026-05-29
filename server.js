import express from 'express';
import dotenv from 'dotenv';
import {
  getStudyDetail,
  createStudy,
  getAllStudy,
  getStudyFocus,
  patchStudyPoint,
  postPwCheck,
  createEmoji,
  createHabit,
  deleteStudy,
} from './controllers/index.js';
import cors from 'cors';

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

// 오늘의 집중
app.get('/studies/:studyId/focus', getStudyFocus);
app.patch('/studies/:studyId/focus', patchStudyPoint);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
