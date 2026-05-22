import express from 'express';
import dotenv from 'dotenv';
import { getStudyDetail } from './controllers/index.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/studies/:studyId', getStudyDetail);

app.listen(process.env.PORT || 3000, () => {
  console.log('서버 실행 중');
});
