import express from 'express';
import dotenv from 'dotenv';
import {
  getStudyDetail,
  createStudy,
  postPwCheck,
} from './controllers/index.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_LOCAL }));
app.use(express.json());

app.get('/studies/:studyId', getStudyDetail);
app.post('/studies/:studyId/confirm-pw', postPwCheck);
app.post('/studies', createStudy);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
