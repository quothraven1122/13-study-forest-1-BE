import { z } from 'zod';
import { HttpError } from './error.js';

export const asyncHandler = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      //zod유효성 검사에러에 걸렸을 때 처리
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      //ex) 없는 id로 요청시 에러 발생
      if (err.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: '데이터를 찾을 수 없습니다',
        });
      }

      //중복되는 데이터 일 때 에러 발생 ex)스터디 이름 중복
      if (err.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: '중복되는 데이터 입니다',
        });
      }

      if (err.code === 'P2003') {
        return res.status(404).json({
          success: false,
          message: '참조하는 데이터가 존재하지 않습니다',
        });
      }

      //HTTPError에 등록해놓은 에러 발생시 에러처리
      if (err instanceof HttpError) {
        return res.status(err.status).json({
          success: false,
          message: err.message,
        });
      }

      //이 외에 서버에러 발생 시 에러 처리
      res.status(500).json({
        success: false,
        message: '서버 에러가 발생했습니다',
      });
    }
  };
};
