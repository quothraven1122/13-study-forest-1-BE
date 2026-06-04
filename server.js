import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { studyController, habitController } from './controllers/index.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/studies', studyController.getAllStudy);
app.post('/studies', studyController.createStudy);
// 전체 스터디
app.get('/studies', getAllStudy);
app.post('/studies', createStudy);

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
// habits 관련 라우터
app.get('/studies/:studyId/habits', getHabits);
app.post('/studies/:studyId/habits', createHabit);
app.patch('/studies/:studyId/habits/:habitId', updateHabit);
app.delete('/studies/:studyId/habits/:habitId', deleteHabit);

// focus 관련 라우터
app.get('/studies/:studyId/focus', getStudyFocus);
app.patch('/studies/:studyId/focus', patchStudyPoint);

// 기타 study 하위 라우터
app.post('/studies/:studyId/confirm-pw', postPwCheck);
app.post('/studies/:studyId/emoji', createEmoji);

// 스터디 상세/수정/삭제
app.get('/studies/:studyId', getStudyDetail);
app.patch('/studies/:studyId', updateStudy);
app.delete('/studies/:studyId', deleteStudy);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
